// import api from "./axios";

// // ADD POST
// export const createPost = async (formData) => {
//   const response = await api.post("/posts/", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return response.data;
// };

import api from "./axios";

export const createPost = async (data) => {
  return api.post("/posts/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};