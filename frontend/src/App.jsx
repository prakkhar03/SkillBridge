import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout";
import { Verification } from "./pages/verification/verification";

const router = createBrowserRouter([
    {
      path: "/",
      element: <PageLayout />,
      children: [
        {
          path: "/",
          element: <Verification />
        },
      ]
    },
  ])

const App = () => {
  return <RouterProvider router={router} />
}

export default App;