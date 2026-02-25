import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import BrowsePage from './pages/BrowsePage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import MessagesPage from './pages/MessagesPage';
import FeedPage from './pages/FeedPage';
import ChatView from './components/ChatView';
import ProfileSetupModal from './components/ProfileSetupModal';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowsePage,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matches',
  component: MatchesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$partnerId',
  component: () => {
    const { partnerId } = chatRoute.useParams();
    return <ChatView partnerId={partnerId} />;
  },
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: FeedPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  matchesRoute,
  profileRoute,
  messagesRoute,
  chatRoute,
  feedRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}
