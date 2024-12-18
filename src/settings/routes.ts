export const routes = {
  root: {
    name: "Home",
    path: "/",
  },
  login: {
    name: "Login",
    path: "/auth",
  },
  signup: {
    name: "Sign Up",
    path: "/auth",
  },
  app: {
    name: "App",
    path: "/app",
    sub: {
      account: {
        name: "Profile",
        path: "/app/account",
      },
      chat: {
        name: "Chat",
        path: "/app/chat",
      },
      up: {
        name: "Upload",
        path: "/app/up",
      },
      users: {
        name: "Users",
        path: "/app/users",
      },
      posts: {
        name: "Posts",
        path: "/app/posts",
        sub: {
          add: {
            name: "Add Post",
            path: "/app/posts/add",
          },
        },
      },
    },
  },
};
