/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignInImport } from './routes/sign-in'
import { Route as IndexImport } from './routes/index'
import { Route as OrgsOrgIdImport } from './routes/orgs_.$orgId'
import { Route as AuthCallbackImport } from './routes/auth.callback'
import { Route as OrgsOrgIdMembersImport } from './routes/orgs_.$orgId_.members'
import { Route as OrgsOrgIdTeamsTeamIdImport } from './routes/orgs_.$orgId_.teams_.$teamId'

// Create/Update Routes

const SignInRoute = SignInImport.update({
  id: '/sign-in',
  path: '/sign-in',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const OrgsOrgIdRoute = OrgsOrgIdImport.update({
  id: '/orgs_/$orgId',
  path: '/orgs/$orgId',
  getParentRoute: () => rootRoute,
} as any)

const AuthCallbackRoute = AuthCallbackImport.update({
  id: '/auth/callback',
  path: '/auth/callback',
  getParentRoute: () => rootRoute,
} as any)

const OrgsOrgIdMembersRoute = OrgsOrgIdMembersImport.update({
  id: '/orgs_/$orgId_/members',
  path: '/orgs/$orgId/members',
  getParentRoute: () => rootRoute,
} as any)

const OrgsOrgIdTeamsTeamIdRoute = OrgsOrgIdTeamsTeamIdImport.update({
  id: '/orgs_/$orgId_/teams_/$teamId',
  path: '/orgs/$orgId/teams/$teamId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/sign-in': {
      id: '/sign-in'
      path: '/sign-in'
      fullPath: '/sign-in'
      preLoaderRoute: typeof SignInImport
      parentRoute: typeof rootRoute
    }
    '/auth/callback': {
      id: '/auth/callback'
      path: '/auth/callback'
      fullPath: '/auth/callback'
      preLoaderRoute: typeof AuthCallbackImport
      parentRoute: typeof rootRoute
    }
    '/orgs_/$orgId': {
      id: '/orgs_/$orgId'
      path: '/orgs/$orgId'
      fullPath: '/orgs/$orgId'
      preLoaderRoute: typeof OrgsOrgIdImport
      parentRoute: typeof rootRoute
    }
    '/orgs_/$orgId_/members': {
      id: '/orgs_/$orgId_/members'
      path: '/orgs/$orgId/members'
      fullPath: '/orgs/$orgId/members'
      preLoaderRoute: typeof OrgsOrgIdMembersImport
      parentRoute: typeof rootRoute
    }
    '/orgs_/$orgId_/teams_/$teamId': {
      id: '/orgs_/$orgId_/teams_/$teamId'
      path: '/orgs/$orgId/teams/$teamId'
      fullPath: '/orgs/$orgId/teams/$teamId'
      preLoaderRoute: typeof OrgsOrgIdTeamsTeamIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/sign-in': typeof SignInRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/orgs/$orgId': typeof OrgsOrgIdRoute
  '/orgs/$orgId/members': typeof OrgsOrgIdMembersRoute
  '/orgs/$orgId/teams/$teamId': typeof OrgsOrgIdTeamsTeamIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/sign-in': typeof SignInRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/orgs/$orgId': typeof OrgsOrgIdRoute
  '/orgs/$orgId/members': typeof OrgsOrgIdMembersRoute
  '/orgs/$orgId/teams/$teamId': typeof OrgsOrgIdTeamsTeamIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/sign-in': typeof SignInRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/orgs_/$orgId': typeof OrgsOrgIdRoute
  '/orgs_/$orgId_/members': typeof OrgsOrgIdMembersRoute
  '/orgs_/$orgId_/teams_/$teamId': typeof OrgsOrgIdTeamsTeamIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/sign-in'
    | '/auth/callback'
    | '/orgs/$orgId'
    | '/orgs/$orgId/members'
    | '/orgs/$orgId/teams/$teamId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/sign-in'
    | '/auth/callback'
    | '/orgs/$orgId'
    | '/orgs/$orgId/members'
    | '/orgs/$orgId/teams/$teamId'
  id:
    | '__root__'
    | '/'
    | '/sign-in'
    | '/auth/callback'
    | '/orgs_/$orgId'
    | '/orgs_/$orgId_/members'
    | '/orgs_/$orgId_/teams_/$teamId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  SignInRoute: typeof SignInRoute
  AuthCallbackRoute: typeof AuthCallbackRoute
  OrgsOrgIdRoute: typeof OrgsOrgIdRoute
  OrgsOrgIdMembersRoute: typeof OrgsOrgIdMembersRoute
  OrgsOrgIdTeamsTeamIdRoute: typeof OrgsOrgIdTeamsTeamIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  SignInRoute: SignInRoute,
  AuthCallbackRoute: AuthCallbackRoute,
  OrgsOrgIdRoute: OrgsOrgIdRoute,
  OrgsOrgIdMembersRoute: OrgsOrgIdMembersRoute,
  OrgsOrgIdTeamsTeamIdRoute: OrgsOrgIdTeamsTeamIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/sign-in",
        "/auth/callback",
        "/orgs_/$orgId",
        "/orgs_/$orgId_/members",
        "/orgs_/$orgId_/teams_/$teamId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/sign-in": {
      "filePath": "sign-in.tsx"
    },
    "/auth/callback": {
      "filePath": "auth.callback.tsx"
    },
    "/orgs_/$orgId": {
      "filePath": "orgs_.$orgId.tsx"
    },
    "/orgs_/$orgId_/members": {
      "filePath": "orgs_.$orgId_.members.tsx"
    },
    "/orgs_/$orgId_/teams_/$teamId": {
      "filePath": "orgs_.$orgId_.teams_.$teamId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
