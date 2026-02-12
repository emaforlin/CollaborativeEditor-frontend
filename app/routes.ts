import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // Public routes
    route("login", "routes/login.tsx"),

    // Authenticated routes wrapped in DocumentContextProvider
    layout("layouts/authenticated-layout.tsx", [
        index("routes/dashboard.tsx"),
        route("editor/:documentID", "routes/editor.tsx"),
    ]),

    // Catch-all route
    route("*", "routes/not_found.tsx"),
] satisfies RouteConfig;
