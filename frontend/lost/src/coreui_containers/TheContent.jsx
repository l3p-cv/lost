import React from 'react'
import { Route, Routes } from 'react-router-dom'

const TheContent = ({ routes }) => (
  <Routes>
    {routes.map(
      (route) =>
        route.component && (
          <Route
            key={route.path}
            path={route.path}
            name={route.name}
            element={
              // <CFade>
              <route.component />
              // </CFade>
            }
          />
        ),
    )}
  </Routes>
)

export default React.memo(TheContent)
