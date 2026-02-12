import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/dashboard.tsx"),
    route("editor/:documentID", "routes/editor.tsx"),
    route("login", "routes/login.tsx"),
    route("*", "routes/not_found.tsx"),
] satisfies RouteConfig;
