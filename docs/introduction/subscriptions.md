---
id: subscriptions
title: Subscriptions
sidebar_label: Subscriptions
---

Subscriptions are GraphQL operations that watch events emitted from your backend. GraphQL-Modules supports GraphQL subscriptions with a little modification in your server code. You can **[read more](https://www.apollographql.com/docs/apollo-server/features/subscriptions.html)** about subscriptions.

Subscriptions need to have defined `PubSub` implementation in your GraphQL-Modules application.

```typescript
  export const CommonModule = new GraphQLModule({
    providers: [
      PubSub
    ]
  });
```

```typescript
  export const PostModule = new GraphQLModule({
    imports: [
      CommonModule
    ],
    providers: [
      PostsProvider
    ],
    typeDefs: gql`
        type Subscription {
          postAdded: Post
        }

        type Query {
          posts: [Post]
        }

        type Mutation {
          addPost(author: String, comment: String): Post
        }

        type Post {
          author: String
          comment: String
        }
    `,
    resolvers: {
        Subscription: {
          postAdded: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: (root, args, { injector }) => injector.get(PubSub).asyncIterator([POST_ADDED]),
          },
        },
        Query: {
          posts: (root, args, { injector }) => injector.get(PostsProvider).posts()
        },
        Mutation: {
          addPost: (root, args, { injector }) => {
            pubsub.publish(POST_ADDED, { postAdded: args });
            return injector.get(PostsProvider).addPost(args);
          },
        },
    }
  })
```

You have to export `subscriptions` from your `AppModule`, and pass it to your GraphQL Server.

```typescript
  const { schema, context, subscriptions } = new GraphQLModule({
    imports: [
      CommonModule,
      PostsModule
    ]
  });

  const server = new ApolloServer({
    schema,
    context,
    subscriptions
  });

  server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
  });
```

## Authentication Over WebSocket using OnConnect hook and Scoped Providers

Session life-time when using WebSocket is the same as the connection's. So, you can keep all the user state in your memory.

```typescript
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { OnConnect } from '@graphql-modules/core';

// This provider has created for each WS/HTTP connection, and kept until the connection is terminated
@Injectable({
  scope: ProviderScope.Session
})
export class AuthProvider implements OnConnect {
  private authToken: string;
  private user: User;
  constructor(private usersProvider: UsersProvider) {}
  // This will be called once immediately after connection established and the session is constructed.
  async onConnect(connectionParams) {
    if (connectionParams.authToken) {
      this.authToken = connectionParams.authToken;
      try {
        await this.validateToken();
        this.user = this.usersProvider.findUserByToken(this.authToken);
      } catch (e) {
        throw new Error('Invalid token');
      }
    } else {
      throw new Error('Missing auth token!');
    }
  }
  private async validateToken() {
    // logic
  }
}
```

### Using in Resolvers

```typescript
    resolvers: {
        Subscription: {
          postAdded: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: withFilter(
                (root, args, { injector }) => injector.get(PubSub).asyncIterator([POST_ADDED]),
                (root, args, { injector }) => payload.userId === injector.get(AuthProvider).user.id
            )
          },
        },
    }
```
