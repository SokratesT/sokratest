export const routes = {
  root: {
    name: "Home",
    path: "/",
  },
  login: {
    name: "Login",
    path: "/login",
  },
  signup: {
    name: "Sign Up",
    path: "/register",
  },
  blog: {
    name: "Blog",
    path: "/blog",
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
        path: "/app/repo",
        sub: {
          add: {
            name: "Add File",
            path: "/app/repo/add",
          },
        },
      },
      users: {
        name: "Users",
        path: "/app/users",
        sub: {
          add: {
            name: "Add User",
            path: "/app/users/add",
          },
        },
      },
      courses: {
        name: "Courses",
        path: "/app/courses",
        sub: {
          add: {
            name: "Add Course",
            path: "/app/courses/add",
          },
          edit: {
            name: "Edit Course",
            path: (id: string) => `/app/courses/edit/${id}`,
          },
        },
      },
      organizations: {
        name: "Organisations",
        path: "/app/orgs",
        sub: {
          add: {
            name: "Add Organization",
            path: "/app/orgs/add",
          },
        },
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
