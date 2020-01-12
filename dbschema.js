const db = {
  users: [
    {
      userId: 'LXWnUzLRPhce7vrch4JvKb6EnGF3',
      email: 'user@email.com',
      nickname: 'user',
      imageUrl: 'https://skakgkskdslf.com',
      isAdmin: false,
      createdAt: '2020-01-10T03:35:54.961Z',
    }
  ],
  sections: [
    {
      index: 0,
      name: 'programming',
      description: 'Something short and leading about the collection below—its contents, the creator, etc. Make it short and sweet, but not too short so folks don&apos;t simply skip over it entirely.'
    }
  ],
  posts: [
    {
      title: 'Title',
      content: 'This is a media card. You can use this section to describe the content.',
      image: 'http://slakjfljalsfd.com',
      author: 'viveloper',
      section: 'programming',
      createdAt: '2020-01-05T11:46:03.628Z',
    }
  ],
  comments: [
    {
      postId: 'post01',
      text: 'this is a comment',
      author: 'nickname01'
    },
    {
      postId: 'post01',
      text: 'this is a comment 2',
      author: 'nickname02'
    }
  ],
  likes: [
    {
      targetId: 'postId or commentId',
      author: 'nickname01'
    }
  ]
}