/**
 * Creates a URL path by replacing dynamic parameters in a path template with their corresponding values.
 *
 * @param pathTemplate - A URL path template containing dynamic parameters in the format `:paramName`
 * @param dynamicParams - An optional object mapping parameter names to their values
 * @returns The path with all dynamic parameters replaced with their values, or the original template if no parameters are provided
 *
 * @example
 * ```typescript
 * makePath('/user/:id', { id: '123' }) // returns '/user/123'
 * makePath('/posts/:category/:id', { category: 'tech', id: '456' }) // returns '/posts/tech/456'
 * makePath('/static/path') // returns '/static/path'
 * ```
 */
const makePath = (
  pathTemplate: string,
  dynamicParams?: { [key: string]: string },
) => {
  if (!dynamicParams) return pathTemplate;
  return Object.entries(dynamicParams).reduce((path, [key, value]) => {
    return path.replace(`:${key}`, value);
  }, pathTemplate);
};

/**
 * Application route definitions containing both public and private routes.
 * @constant
 * @type {Object}
 *
 * Each route object contains:
 * @property {string} name - Display name of the route
 * @property {string} pathTemplate - URL template for the route
 * @property {Function} getPath - Function to generate the final URL with parameters
 */
export const ROUTES = {
  PUBLIC: {
    root: {
      name: "Home",
      pathTemplate: "/",
      getPath: function () {
        return makePath(this.pathTemplate);
      },
    },
    login: {
      name: "Login",
      pathTemplate: "/login",
      getPath: function () {
        return makePath(this.pathTemplate);
      },
    },
    signup: {
      name: "Sign Up",
      pathTemplate: "/register",
      getPath: function () {
        return makePath(this.pathTemplate);
      },
    },
    blog: {
      name: "Blog",
      pathTemplate: "/blog",
      getPath: function () {
        return makePath(this.pathTemplate);
      },
    },
  },
  PRIVATE: {
    root: {
      name: "App",
      pathTemplate: "/app",
      getPath: function () {
        return makePath(this.pathTemplate);
      },
    },
    app: {
      account: {
        name: "Profile",
        pathTemplate: "/app/account",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
    },
    chat: {
      root: {
        name: "Chat",
        pathTemplate: "/app/chat",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add Chat",
        pathTemplate: "/app/chat/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      view: {
        name: "View Chat",
        pathTemplate: "/app/chat/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
    },
    documents: {
      root: {
        name: "Documents",
        pathTemplate: "/app/docs",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add Document",
        pathTemplate: "/app/docs/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      view: {
        name: "View Document",
        pathTemplate: "/app/docs/view/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      edit: {
        name: "Edit Document",
        pathTemplate: "/app/docs/edit/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      chunks: {
        root: {
          name: "View Chunks",
          pathTemplate: "/app/docs/view/:id/chunks",
          getPath: function (params: { id: string }) {
            return makePath(this.pathTemplate, params);
          },
        },
      },
      playground: {
        name: "Document Playground",
        pathTemplate: "/app/docs/playground",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
    },
    users: {
      root: {
        name: "Users",
        pathTemplate: "/app/users",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add User",
        pathTemplate: "/app/users/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      edit: {
        name: "Edit User",
        pathTemplate: "/app/users/edit/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
    },
    courses: {
      root: {
        name: "Courses",
        pathTemplate: "/app/courses",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add Course",
        pathTemplate: "/app/courses/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      edit: {
        name: "Edit Course",
        pathTemplate: "/app/courses/edit/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      view: {
        name: "View Course",
        pathTemplate: "/app/courses/view/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      members: {
        name: "Course Members",
        pathTemplate: "/app/courses/view/:id/members",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
    },
    organizations: {
      root: {
        name: "Organizations",
        pathTemplate: "/app/orgs",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add Organization",
        pathTemplate: "/app/orgs/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      edit: {
        name: "Edit Organization",
        pathTemplate: "/app/orgs/edit/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      view: {
        name: "View Organization",
        pathTemplate: "/app/orgs/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      members: {
        name: "Organization Members",
        pathTemplate: "/app/orgs/view/:id/members",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
    },
    posts: {
      root: {
        name: "Posts",
        pathTemplate: "/app/posts",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      add: {
        name: "Add Post",
        pathTemplate: "/app/posts/add",
        getPath: function () {
          return makePath(this.pathTemplate);
        },
      },
      edit: {
        name: "Edit Post",
        pathTemplate: "/app/posts/edit/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
      view: {
        name: "View Post",
        pathTemplate: "/app/posts/:id",
        getPath: function (params: { id: string }) {
          return makePath(this.pathTemplate, params);
        },
      },
    },
  },
};
