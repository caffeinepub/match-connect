import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Message {
    content: string;
    read: boolean;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface PhotoPost {
    owner: Principal;
    timestamp: Time;
    caption: string;
    photo: ExternalBlob;
}
export interface MatchDecision {
    id: Principal;
    decision: Variant_like_pass;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_like_pass {
    like = "like",
    pass = "pass"
}
export interface backendInterface {
    addInterest(interest: string): Promise<string>;
    addMatchDecision(likeDecision: MatchDecision): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPhotoPost(photo: ExternalBlob, caption: string, timestamp: Time): Promise<void>;
    createProfile(displayName: string, age: bigint, bio: string): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }>;
    findUsersMatchingInterestQuery(interest: string): Promise<Array<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    } | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(partner: Principal): Promise<{
        sent: Array<Message>;
        unreadCount: bigint;
        received: Array<Message>;
    }>;
    getFeed(matchedUsers: Array<Principal>, _limit: bigint): Promise<Array<PhotoPost>>;
    getOwnProfileQuery(): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }>;
    getPhotoPost(_postId: bigint): Promise<PhotoPost | null>;
    getProfileByIdQuery(id: Principal): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }>;
    getProfileWithPosts(id: Principal): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        photoPosts: Array<PhotoPost>;
        interests: Array<string>;
    } | null>;
    getProfiles(): Promise<Array<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }>>;
    getUserMatchesQuery(user: Principal): Promise<Array<MatchDecision>>;
    getUserPosts(user: Principal): Promise<Array<PhotoPost>>;
    getUserProfile(user: Principal): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    } | null>;
    getUserProfileWithPosts(user: Principal): Promise<{
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        photoPosts: Array<PhotoPost>;
        interests: Array<string>;
    } | null>;
    isCallerAdmin(): Promise<boolean>;
    markAsRead(partner: Principal): Promise<void>;
    saveCallerUserProfile(profile: {
        id: Principal;
        age: bigint;
        bio: string;
        displayName: string;
        interests: Array<string>;
    }): Promise<void>;
    sendMessage(recipient: Principal, content: string, timestamp: Time): Promise<void>;
}
