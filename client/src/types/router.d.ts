import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    personal?: boolean
    group?: boolean
  }
}
