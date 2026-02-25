import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';
import type { MatchDecision, Variant_like_pass, Message, PhotoPost } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<{
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  } | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      id: Principal;
      displayName: string;
      age: bigint;
      bio: string;
      interests: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  }>>({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProfileById(id: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  } | null>({
    queryKey: ['profile', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProfileByIdQuery(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    id: Principal;
    displayName: string;
    age: bigint;
    bio: string;
    interests: string[];
  } | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useAddMatchDecision() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (decision: MatchDecision) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMatchDecision(decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useGetUserMatches(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MatchDecision[]>({
    queryKey: ['matches', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return actor.getUserMatchesQuery(userId);
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useAddInterest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interest: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInterest(interest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetConversation(partner: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    sent: Message[];
    received: Message[];
    unreadCount: bigint;
  }>({
    queryKey: ['conversation', partner?.toString()],
    queryFn: async () => {
      if (!actor || !partner) throw new Error('Actor or partner not available');
      return actor.getConversation(partner);
    },
    enabled: !!actor && !actorFetching && !!partner,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipient,
      content,
      image,
    }: {
      recipient: Principal;
      content: string;
      image?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now() * 1000000);
      return actor.sendMessage(recipient, content, image ?? null, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipient.toString()] });
    },
  });
}

export function useMarkAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAsRead(partner);
    },
    onSuccess: (_, partner) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', partner.toString()] });
    },
  });
}

export function useCreatePhotoPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photo,
      caption,
    }: {
      photo: import('../backend').ExternalBlob;
      caption: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now() * 1000000);
      return actor.createPhotoPost(photo, caption, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

export function useGetFeed(matchedUsers: Principal[]) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhotoPost[]>({
    queryKey: ['feed', matchedUsers.map(u => u.toString()).join(',')],
    queryFn: async () => {
      if (!actor || matchedUsers.length === 0) return [];
      return actor.getFeed(matchedUsers, BigInt(50));
    },
    enabled: !!actor && !actorFetching && matchedUsers.length > 0,
  });
}

export function useGetUserPosts(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhotoPost[]>({
    queryKey: ['userPosts', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserPosts(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}
