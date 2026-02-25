import Map "mo:core/Map";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldMessage = {
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  module OldMessage {
    public func compare(a : OldMessage, b : OldMessage) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  type OldActor = {
    profiles : Map.Map<Principal, {
      id : Principal;
      displayName : Text;
      age : Nat;
      bio : Text;
      interests : Set.Set<Text>;
    }>;
    matchDecisions : Map.Map<Principal, Set.Set<{
      id : Principal;
      decision : {
        #like;
        #pass;
      };
    }>>;
    messages : Map.Map<Principal, Map.Map<Principal, Set.Set<OldMessage>>>;
    photoPosts : Map.Map<Principal, [{
      owner : Principal;
      photo : Storage.ExternalBlob;
      caption : Text;
      timestamp : Time.Time;
    }]>;
  };

  type NewMessage = {
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
    image : ?Text;
  };

  module NewMessage {
    public func compare(a : NewMessage, b : NewMessage) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  type NewActor = {
    profiles : Map.Map<Principal, {
      id : Principal;
      displayName : Text;
      age : Nat;
      bio : Text;
      interests : Set.Set<Text>;
    }>;
    matchDecisions : Map.Map<Principal, Set.Set<{
      id : Principal;
      decision : {
        #like;
        #pass;
      };
    }>>;
    messages : Map.Map<Principal, Map.Map<Principal, Set.Set<NewMessage>>>;
    photoPosts : Map.Map<Principal, [{
      owner : Principal;
      photo : Storage.ExternalBlob;
      caption : Text;
      timestamp : Time.Time;
    }]>;
  };

  public func run(old : OldActor) : NewActor {
    let newMessages = old.messages.map<Principal, Map.Map<Principal, Set.Set<OldMessage>>, Map.Map<Principal, Set.Set<NewMessage>>>(
      func(_sender, oldRecipientMap) {
        oldRecipientMap.map(
          func(_recipient, oldMessageSet) {
            transformOldMessagesToNew(oldMessageSet);
          }
        );
      }
    );

    {
      old with
      messages = newMessages;
    };
  };

  func transformOldMessagesToNew(oldMessages : Set.Set<OldMessage>) : Set.Set<NewMessage> {
    let iter = oldMessages.values();
    Set.fromIter(iter.map(func(oldMsg) { { oldMsg with image = null } }), );
  };
};
