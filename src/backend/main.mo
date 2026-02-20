import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Profile = {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : Set.Set<Text>;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Principal.compare(profile1.id, profile2.id);
    };
  };

  type MatchDecision = {
    id : Principal;
    decision : {
      #like;
      #pass;
    };
  };

  module MatchDecision {
    public func compare(a : MatchDecision, b : MatchDecision) : Order.Order {
      Principal.compare(a.id, b.id);
    };
  };

  let profiles = Map.empty<Principal, Profile>();
  let matchDecisions = Map.empty<Principal, Set.Set<MatchDecision>>();

  type Message = {
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  module Message {
    public func compare(a : Message, b : Message) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let messages = Map.empty<Principal, Map.Map<Principal, Set.Set<Message>>>();

  type PhotoPost = {
    owner : Principal;
    photo : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  let photoPosts = Map.empty<Principal, [PhotoPost]>();

  func requireUserRole(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func areUsersMatched(user1 : Principal, user2 : Principal) : Bool {
    let user1Matches = switch (matchDecisions.get(user1)) {
      case (null) { return false };
      case (?decisions) { decisions };
    };

    let user2Matches = switch (matchDecisions.get(user2)) {
      case (null) { return false };
      case (?decisions) { decisions };
    };

    let user1LikesUser2 = user1Matches.any(func(d) { d.id == user2 and d.decision == #like });
    let user2LikesUser1 = user2Matches.any(func(d) { d.id == user1 and d.decision == #like });

    user1LikesUser2 and user2LikesUser1;
  };

  public shared ({ caller }) func getCallerUserProfile() : async ?{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  } {
    requireUserRole(caller);
    switch (profiles.get(caller)) {
      case (null) { null };
      case (?profile) {
        ?{
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  }) : async () {
    requireUserRole(caller);
    if (profile.id != caller) {
      Runtime.trap("Unauthorized: Can only save your own profile");
    };

    let interests = Set.empty<Text>();
    for (interest in profile.interests.values()) {
      interests.add(interest);
    };

    let newProfile : Profile = {
      id = caller;
      displayName = profile.displayName;
      age = profile.age;
      bio = profile.bio;
      interests;
    };

    profiles.add(caller, newProfile);
  };

  public shared ({ caller }) func getUserProfile(user : Principal) : async ?{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  } {
    requireUserRole(caller);
    switch (profiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
        };
      };
    };
  };

  public shared ({ caller }) func createProfile(displayName : Text, age : Nat, bio : Text) : async {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  } {
    requireUserRole(caller);

    let interests = Set.empty<Text>();
    let profile : Profile = {
      interests;
      id = caller;
      displayName;
      age;
      bio = if (bio.isEmpty()) { "No bio found for this user" } else { bio };
    };

    if (profiles.containsKey(caller)) {
      Runtime.trap("Profile already exists for this user");
    };

    profiles.add(caller, profile);
    {
      id = profile.id;
      displayName = profile.displayName;
      age = profile.age;
      bio = profile.bio;
      interests = profile.interests.values().toArray();
    };
  };

  public shared ({ caller }) func getOwnProfileQuery() : async {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  } {
    requireUserRole(caller);

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found for this user");
      };
      case (?profile) {
        {
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
        };
      };
    };
  };

  public shared ({ caller }) func getProfiles() : async [{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  }] {
    requireUserRole(caller);

    profiles.values().toArray().map(func(profile) { { id = profile.id; displayName = profile.displayName; age = profile.age; bio = profile.bio; interests = profile.interests.values().toArray() } });
  };

  public shared ({ caller }) func findUsersMatchingInterestQuery(interest : Text) : async [{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  }] {
    requireUserRole(caller);

    profiles.values().toArray().filter(
      func(profile) { profile.interests.contains(interest) }
    ).map(func(profile) { { id = profile.id; displayName = profile.displayName; age = profile.age; bio = profile.bio; interests = profile.interests.values().toArray() } });
  };

  func swapProfileInterest(profile : Profile, interest : Text) : Profile {
    let newInterests = Set.empty<Text>();
    for (existingInterest in profile.interests.values()) {
      newInterests.add(existingInterest);
    };
    newInterests.add(interest);

    {
      id = profile.id;
      displayName = profile.displayName;
      age = profile.age;
      bio = profile.bio;
      interests = newInterests;
    };
  };

  public shared ({ caller }) func addInterest(interest : Text) : async Text {
    requireUserRole(caller);
    let state = profiles;
    await addInterestInternal(caller, interest, state);
    "Interest added successfully";
  };

  func addInterestInternal(caller : Principal, interest : Text, state : Map.Map<Principal, Profile>) : async () {
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found for this user") };
      case (?profile) {
        if (profile.interests.contains(interest)) {
          Runtime.trap("Interest already exists in profile");
        };
        state.add(caller, swapProfileInterest(profile, interest));
      };
    };
  };

  public shared ({ caller }) func addMatchDecision(likeDecision : MatchDecision) : async () {
    requireUserRole(caller);

    let decisions = matchDecisions;

    switch (matchDecisions.get(caller)) {
      case (null) {
        let newSet = Set.empty<MatchDecision>();
        newSet.add(likeDecision);
        decisions.add(caller, newSet);
      };
      case (?existingSet) {
        existingSet.add(likeDecision);
      };
    };
  };

  public shared ({ caller }) func getUserMatchesQuery(user : Principal) : async [MatchDecision] {
    requireUserRole(caller);

    // Privacy: Users can only view their own match decisions
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own match decisions");
    };

    switch (matchDecisions.get(user)) {
      case (null) {
        Runtime.trap("No matches found for user " # user.toText());
      };
      case (?existingMatches) { existingMatches.toArray() };
    };
  };

  public shared ({ caller }) func getAllUsers() : async [Principal] {
    requireUserRole(caller);
    profiles.keys().toArray();
  };

  public shared ({ caller }) func getProfileByIdQuery(id : Principal) : async {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
  } {
    requireUserRole(caller);

    switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile not found for user id " # id.toText()) };
      case (?profile) {
        {
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
        };
      };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text, timestamp : Time.Time) : async () {
    requireUserRole(caller);

    // Verify users are matched before allowing messaging
    if (not areUsersMatched(caller, recipient)) {
      Runtime.trap("Unauthorized: Can only message matched users");
    };

    let newMessage : Message = {
      sender = caller;
      recipient;
      content;
      timestamp;
      read = false;
    };

    switch (messages.get(caller)) {
      case (null) {
        let recipientMessages = Map.empty<Principal, Set.Set<Message>>();
        let newSet = Set.empty<Message>();
        newSet.add(newMessage);
        recipientMessages.add(recipient, newSet);
        messages.add(caller, recipientMessages);
      };
      case (?recipientMessages) {
        switch (recipientMessages.get(recipient)) {
          case (null) {
            let newSet = Set.empty<Message>();
            newSet.add(newMessage);
            recipientMessages.add(recipient, newSet);
          };
          case (?existingSet) {
            let exists = existingSet.any(func(existing) { existing.timestamp == newMessage.timestamp });

            if (exists) {
              Runtime.trap("Duplicate message detected");
            };

            existingSet.add(newMessage);
          };
        };
      };
    };
  };

  public shared ({ caller }) func getConversation(partner : Principal) : async {
    sent : [Message];
    received : [Message];
    unreadCount : Nat;
  } {
    requireUserRole(caller);

    // Verify users are matched before showing conversation
    if (not areUsersMatched(caller, partner)) {
      Runtime.trap("Unauthorized: Can only view conversations with matched users");
    };

    let sentMessages = switch (messages.get(caller)) {
      case (null) { [] };
      case (?recipientMessages) {
        switch (recipientMessages.get(partner)) {
          case (null) { [] };
          case (?msgSet) { msgSet.toArray() };
        };
      };
    };

    let receivedMessages = switch (messages.get(partner)) {
      case (null) { [] };
      case (?recipientMessages) {
        switch (recipientMessages.get(caller)) {
          case (null) { [] };
          case (?msgSet) { msgSet.toArray() };
        };
      };
    };

    var unreadCount = 0;
    for (msg in receivedMessages.values()) {
      if (not msg.read) { unreadCount += 1 };
    };

    {
      sent = sentMessages;
      received = receivedMessages;
      unreadCount;
    };
  };

  public shared ({ caller }) func markAsRead(partner : Principal) : async () {
    requireUserRole(caller);

    // Verify users are matched before allowing mark as read
    if (not areUsersMatched(caller, partner)) {
      Runtime.trap("Unauthorized: Can only mark messages as read from matched users");
    };

    switch (messages.get(partner)) {
      case (?recipientMessages) {
        switch (recipientMessages.get(caller)) {
          case (?existingSet) {
            let updated = existingSet.map<Message, Message>(
              func(msg) { if (not msg.read) { { msg with read = true } } else { msg } }
            );
            recipientMessages.add(caller, updated);
          };
          case (null) {};
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func createPhotoPost(photo : Storage.ExternalBlob, caption : Text, timestamp : Time.Time) : async () {
    requireUserRole(caller);

    let newPost : PhotoPost = {
      owner = caller;
      photo;
      caption;
      timestamp;
    };

    switch (photoPosts.get(caller)) {
      case (null) {
        photoPosts.add(caller, [newPost]);
      };
      case (?existingPosts) {
        photoPosts.add(caller, existingPosts.concat([newPost]));
      };
    };
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [PhotoPost] {
    requireUserRole(caller);

    // Users can view posts from matched users or their own posts
    if (caller != user and not areUsersMatched(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view posts from matched users");
    };

    switch (photoPosts.get(user)) {
      case (null) { [] };
      case (?posts) { posts };
    };
  };

  public query ({ caller }) func getFeed(matchedUsers : [Principal], _limit : Nat) : async [PhotoPost] {
    requireUserRole(caller);

    // Verify all users in matchedUsers are actually matched with caller
    for (user in matchedUsers.values()) {
      if (not areUsersMatched(caller, user)) {
        Runtime.trap("Unauthorized: Feed can only include matched users");
      };
    };

    let matchedPostsIter = matchedUsers.values().flatMap(
      func(user) {
        switch (photoPosts.get(user)) {
          case (null) { [].values() };
          case (?posts) { posts.values() };
        };
      }
    );

    // No limit applied
    matchedPostsIter.toArray();
  };

  public query ({ caller }) func getPhotoPost(_postId : Nat) : async ?PhotoPost {
    requireUserRole(caller);

    // This function needs proper implementation - currently only returns caller's first post
    // For now, restrict to caller's own posts
    switch (photoPosts.get(caller)) {
      case (null) { null };
      case (?posts) {
        if (posts.size() == 0) { return null };
        ?posts[0];
      };
    };
  };

  public query ({ caller }) func getUserProfileWithPosts(user : Principal) : async ?{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
    photoPosts : [PhotoPost];
  } {
    requireUserRole(caller);

    // Users can view profile+posts from matched users or their own
    if (caller != user and not areUsersMatched(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view profiles with posts from matched users");
    };

    switch (profiles.get(user)) {
      case (null) { null };
      case (?profile) {
        let photoPostsArray = switch (photoPosts.get(user)) {
          case (null) { [] };
          case (?posts) { posts };
        };

        ?{
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
          photoPosts = photoPostsArray;
        };
      };
    };
  };

  public query ({ caller }) func getProfileWithPosts(id : Principal) : async ?{
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : [Text];
    photoPosts : [PhotoPost];
  } {
    requireUserRole(caller);

    // Users can view profile+posts from matched users or their own
    if (caller != id and not areUsersMatched(caller, id) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view profiles with posts from matched users");
    };

    switch (profiles.get(id)) {
      case (null) { null };
      case (?profile) {
        let photoPostsArray = switch (photoPosts.get(id)) {
          case (null) { [] };
          case (?posts) { posts };
        };
        ?{
          id = profile.id;
          displayName = profile.displayName;
          age = profile.age;
          bio = profile.bio;
          interests = profile.interests.values().toArray();
          photoPosts = photoPostsArray;
        };
      };
    };
  };
};
