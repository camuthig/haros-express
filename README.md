# Little John
Little John is a thought experiment for me to mess around with building my own API gateway. Think something like [StrongLoop's odl API Connect](https://docs.strongloop.com/display/LGW/StrongLoop+API+Gateway) The gateway should be able to:

1. Route traffic to any number of servers/APIs
1. Handle management (including live reload) of forward servers
1. Handle creation and management of users. I'm just tired of rebuilding this kind of thing for all of my toy projects.

What it is not:

1. Production ready. This is just for me to screw around with for now. I want to make it usable, but don't have time for real production capabilities.

## Future Improvements and To Do's

1. Standardize JSON API probably around the official [spec](jsonapi.org)
1. Get some unit tests in there
1. Add in some simple, extendable frontend components
1. Add Consul support for forwarded services
1. Add metrics tracking
1. Add throttling
1. Add circuit breaking, retry and other behaviors great for forwarding to microservices
1. Add access control for forwarded services (meh, not sure I like this idea)
1. Clean up real time forwarding information (currently in memory, but that doesn't scale horizontally)