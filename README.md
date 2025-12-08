# Hypna.space HypnoSpec Implementation

This is the live implementation of [HypnoSpec](https://hypna.space/hypnospec/) on [Hypna.space](https://hypna.space)!

Currently this implementation is compliant with `2025-07`.

## About this implementation

This implementation is written in TypeScript with some elements from the Angular application that Hypna.space Uses to render spirals and sessions.

* The `spec/` folder is intended to be as platform agnostic as possible (i.e. you do NOT need to run angular for it); however, elements like the unified service expect an Angular-like Service Composable.

* `custom/` contains the YuukSpace Script (YSS) parsing service.

* `services/` contains the Hypnospec Utility Service which allows for all the services to talk to eachother. As mentioned above, this system expects Angular, but you can thread in anything you want as long as it serves the same idea.
