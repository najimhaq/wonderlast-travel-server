//controllers/useControllers.js


// !get all todos - get
// const getAllTodos = asyncHandler(async (req, res) => {
//   try {
//     const todos = await Todo.find()
//     // .select({
//     //   _id: 0,
//     //   date: 0,
//     //   createdAt: 0,
//     //   updatedAt: 0,
//     // });
//     res.status(200).json({
//       success: true,
//       count: todos.length,
//       data: todos,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message,
//     });
//   }
// });
