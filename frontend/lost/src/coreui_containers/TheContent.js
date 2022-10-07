import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { CContainer, CFade } from '@coreui/react'

const TheContent = ({ routes }) => (
    <main className="c-main">
        <CContainer fluid>
            <Routes>
                {
                    routes.map(
                        (route) =>
                            route.component && (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    exact={route.exact}
                                    name={route.name}
                                    element={
                                        <CFade>
                                            <route.component />
                                        </CFade>
                                    }
                                />
                            ),
                    )
                }
            </Routes>
        </CContainer>
    </main>
)

export default React.memo(TheContent)
