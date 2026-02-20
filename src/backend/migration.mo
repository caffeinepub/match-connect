import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  type OldProfile = {
    id : Principal;
    displayName : Text;
    age : Nat;
    bio : Text;
    interests : Set.Set<Text>;
  };

  type OldMatchDecision = {
    id : Principal;
    decision : {
      #like;
      #pass;
    };
  };

  type OldActor = {
    profiles : Map.Map<Principal, OldProfile>;
    matchDecisions : Map.Map<Principal, Set.Set<OldMatchDecision>>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    {
      profiles = old.profiles;
      matchDecisions = old.matchDecisions;
    };
  };
};
