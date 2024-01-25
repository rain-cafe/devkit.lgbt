import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { ErrorPage } from './routes/ErrorPage';
import { Root } from './routes/Root';
import { TodoList } from './routes/TodoList';
import { TodoLists } from './routes/TodoLists';
import { IStorage, Storage } from './storage';

export function hook(storage: IStorage) {
  console.log(`📡 Initializing storage...`);
  Storage.init(storage);

  console.log(`☄️ Setting up router...`);
  const router = createHashRouter([
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/todo',
          element: <TodoLists />,
          loader: TodoLists.loader,
        },
        {
          path: '/todo/:id',
          element: <TodoList />,
          loader: TodoList.loader,
        },
      ],
    },
  ]);

  console.log(`🚀 Launching app!`);
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
