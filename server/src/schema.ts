import { permissions } from './permissions'
import { APP_SECRET, getUserId } from './utils'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { applyMiddleware } from 'graphql-middleware'
import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('users', {
      type: 'User',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany()
      },
    })

    t.nullable.field('me', {
      type: 'User',
      resolve: (parent, args, context: Context) => {
        const userId = getUserId(context)
        return context.prisma.user.findUnique({
          where: {
            id: Number(userId),
          },
        })
      },
    })

    t.nullable.field('profile', {
      type: 'Profile',
      resolve: (parent, args, context: Context) => {
        const userId = getUserId(context)
        return context.prisma.profile.findUnique({
          where: {
            userId: Number(userId),
          },
        })
      },
    })

    // t.nullable.field('postById', {
    //   type: 'Post',
    //   args: {
    //     id: intArg(),
    //   },
    //   resolve: (_parent, args, context: Context) => {
    //     return context.prisma.post.findUnique({
    //       where: { id: args.id || undefined },
    //     })
    //   },
    // })

    // t.nonNull.list.nonNull.field('feed', {
    //   type: 'Post',
    //   args: {
    //     searchString: stringArg(),
    //     skip: intArg(),
    //     take: intArg(),
    //     orderBy: arg({
    //       type: 'PostOrderByUpdatedAtInput',
    //     }),
    //   },
    //   resolve: (_parent, args, context: Context) => {
    //     const or = args.searchString
    //       ? {
    //           OR: [
    //             { title: { contains: args.searchString } },
    //             { content: { contains: args.searchString } },
    //           ],
    //         }
    //       : {}

    //     return context.prisma.post.findMany({
    //       where: {
    //         published: true,
    //         ...or,
    //       },
    //       take: args.take || undefined,
    //       skip: args.skip || undefined,
    //       orderBy: args.orderBy || undefined,
    //     })
    //   },
    // })

    // t.list.field('draftsByUser', {
    //   type: 'Post',
    //   args: {
    //     userUniqueInput: nonNull(
    //       arg({
    //         type: 'UserUniqueInput',
    //       }),
    //     ),
    //   },
    //   resolve: (_parent, args, context: Context) => {
    //     return context.prisma.user
    //       .findUnique({
    //         where: {
    //           id: args.userUniqueInput.id || undefined,
    //           email: args.userUniqueInput.email || undefined,
    //         },
    //       })
    //       .posts({
    //         where: {
    //           published: false,
    //         },
    //       })
    //   },
    // })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const hashedPassword = await hash(args.password, 10)
        const user = await context.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            password: hashedPassword,
          },
        })
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, context: Context) => {
        const user = await context.prisma.user.findUnique({
          where: {
            email,
          },
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })
		t.field("createProfile", {
			type: Profile,
			args: {
				bio: stringArg(),
				location: stringArg(),
				website: stringArg(),
				avatar: stringArg()
			},
			resolve: (parent, args, ctx) => {
				const userId = getUserId(ctx)
				if (!userId) throw new Error("Could not authenticate user.")
				return ctx.prisma.profile.create({
					data: {
						...args,
						User: { connect: { id: Number(userId) } }
					}
				})
			}
		})
    t.field("updateProfile", {
			type: "Profile",
			args: {
				id: intArg(),
				bio: stringArg(),
				location: stringArg(),
				website: stringArg(),
				avatar: stringArg()
			},
			resolve: (parent, { id, ...args }, ctx) => {

				return ctx.prisma.profile.update({
					data: {
						...args
					},
					where: {
						id: Number(id)
					}
				})
			}
		})
    


    t.field("createTweet", {
      type: "Tweet",
      args: {
        content: stringArg(),
      },
      resolve: async (parent, { content }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error("Could not authenticate user.")
        
        if (content == null) {
          throw new Error("Content cannot be null or undefined.")
        }

        const newTweet = await ctx.prisma.tweet.create({
          data: {
            content,
            author: { connect: { id: Number(userId) } },
          },
          include: {
            author: true, 
          },
        })

    return {
      id: newTweet.id,
      createdAt: newTweet.createdAt,
      content: newTweet.content || '', 
      authorId: newTweet.authorId,
      author: newTweet.author
        ? {
            id: newTweet.author.id,
            email: newTweet.author.email,
            name: newTweet.author.name,
          }
        : { email: '', id: 0, name: null }, 
    }
  },
})

    // t.field('togglePublishPost', {
    //   type: 'Post',
    //   args: {
    //     id: nonNull(intArg()),
    //   },
    //   resolve: async (_, args, context: Context) => {
    //     try {
    //       const post = await context.prisma.post.findUnique({
    //         where: { id: args.id || undefined },
    //         select: {
    //           published: true,
    //         },
    //       })
    //       return context.prisma.post.update({
    //         where: { id: args.id || undefined },
    //         data: { published: !post?.published },
    //       })
    //     } catch (e) {
    //       throw new Error(
    //         `Post with ID ${args.id} does not exist in the database.`,
    //       )
    //     }
    //   },
    // })

    // t.field('incrementPostViewCount', {
    //   type: 'Post',
    //   args: {
    //     id: nonNull(intArg()),
    //   },
    //   resolve: (_, args, context: Context) => {
    //     return context.prisma.post.update({
    //       where: { id: args.id || undefined },
    //       data: {
    //         viewCount: {
    //           increment: 1,
    //         },
    //       },
    //     })
    //   },
    // })

    // t.field('deletePost', {
    //   type: 'Post',
    //   args: {
    //     id: nonNull(intArg()),
    //   },
    //   resolve: (_, args, context: Context) => {
    //     return context.prisma.post.delete({
    //       where: { id: args.id },
    //     })
    //   },
    // })
  },
})

const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.nonNull.int('id')   
    t.string('bio')
    t.string('location')
    t.string('website')
    t.string('avatar')
  },
})

// const User = objectType({
//   name: 'User',
//   definition(t) {
//     t.id('id')
//     t.string('name')
//     t.string('email')
//     t.list.field('tweets', {
//       type: Tweet,
//     })
//     t.field('profile', {
//       type: Profile
//     })
//   }
// })

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
  },
})


const Tweet = objectType({
  name: 'Tweet',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('content')
    t.nonNull.field('author', { type: User }) 
  },
})



const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

const PostOrderByUpdatedAtInput = inputObjectType({
  name: 'PostOrderByUpdatedAtInput',
  definition(t) {
    t.nonNull.field('updatedAt', { type: 'SortOrder' })
  },
})

const UserUniqueInput = inputObjectType({
  name: 'UserUniqueInput',
  definition(t) {
    t.int('id')
    t.string('email')
  },
})

const PostCreateInput = inputObjectType({
  name: 'PostCreateInput',
  definition(t) {
    t.nonNull.string('title')
    t.string('content')
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
    t.list.nonNull.field('posts', { type: 'PostCreateInput' })
  },
})

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', { type: 'User' })
  },
})

const schemaWithoutPermissions = makeSchema({
  types: [
    Query,
    Mutation,
    Tweet,
    User,
    AuthPayload,
    UserUniqueInput,
    UserCreateInput,
    PostCreateInput,
    SortOrder,
    PostOrderByUpdatedAtInput,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})

export const schema = applyMiddleware(schemaWithoutPermissions, permissions)
