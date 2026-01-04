import { useEffect, type FC } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import AUTH from '@features/auth/queries/Auth'
import type AuthQuery from '@type/graphql/core/app'
import { useDispatch, useSelector } from 'react-redux'
import { setAccessToken, setUser, setVerified, setSearch } from '@store/slices/core/app'
import type { RootState } from '@store/store'
import axios from 'axios'
import '@assets/styles/global.css'
import Navbar from '@components/layouts/Navbar'
import Home from '@components/views/Home'
import Register from '@components/auth/Register'
import Verify from '@components/auth/Verify'
import Login from '@components/auth/Login'
import Collection from '@components/views/Collection'
import API from '@components/views/API'
import Settings from '@components/auth/Settings'
import Forget from '@components/auth/Forget'
import Reset from '@components/auth/Reset'
import NotFound from '@components/common/NotFound'
import Main from '@routes/Main'
import Auth from '@routes/Auth'
import Verified from '@routes/Verified'
import Protected from '@routes/Protected'
import Load from '@components/common/Load'

const App: FC = () => {
    const { pathname } = useLocation()
    const showNavbar = ['/', '/collection', '/API'].some(path => pathname === path) || pathname.startsWith('/search/') || pathname.startsWith('/collection/')
    const showBackLink = ['/register', '/login', '/forget-password'].includes(pathname)
    const noHeader = ['/settings', '/verify'].includes(pathname)
    const dispatch = useDispatch()
    const appState = useSelector((state: RootState) => state.app)
    const { accessToken, search, user, verified } = appState
    const { loading, data, error } = useQuery<AuthQuery>(AUTH, { skip: !accessToken, fetchPolicy: 'no-cache' })
    useEffect(() => {
        if (accessToken) return
        (async () => {
            try {
                const res = await axios.post(`http://${import.meta.env['VITE_DOMAIN']}:${import.meta.env['VITE_SERVER_PORT']}/auth`, {
                    identity: {
                        tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                        screenRes: `${window.screen.width}x${window.screen.height}`,
                        colorDepth: String(window.screen.colorDepth),
                        devicePixelRatio: String(window.devicePixelRatio || 1),
                        touchSupport: ('ontouchstart' in window).toString(),
                        hardwareConcurrency: String(navigator.hardwareConcurrency || '')
                    }
                }, { withCredentials: true })
                dispatch(setAccessToken(res.data))
            } catch {
                dispatch(setAccessToken(null))
                dispatch(setUser(null))
            }
        })()
    }, [])
    useEffect(() => {
        if (!loading) {
            if (data) {
                dispatch(setUser(data.auth))
                dispatch(setVerified(data.auth!.verified))
            } else if (error) dispatch(setUser(null))
        }
    }, [loading, data, error])
    const searchHandler = (search: string) => dispatch(setSearch(search))
    if (loading) return <Load />
    return (
        <>
            {!noHeader && (
                <header className="fixed w-screen">
                    {showNavbar && <Navbar isUser={user} onSearch={searchHandler} />}
                    {showBackLink && (
                        <a href="/" className="absolute top-4 left-4 text-[1.2rem] text-white no-underline">&#8592; Back to home</a>
                    )}
                </header>
            )}
            <main>
                <Routes>
                    <Route element={<Main user={user} verified={verified} />}>
                        <Route path='/' element={<Home isUser={user} search={search} />} />
                        <Route path='/search/:query/:page' element={<Home isUser={user} search={search} />} />
                    </Route>
                    <Route element={<Auth verified={verified} />}>
                        <Route path='/register' element={<Register />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/forget-password' element={<Forget />} />
                        <Route path='/reset/:id/:token' element={<Reset />} />
                    </Route>
                    <Route element={<Verified verified={verified} />}>
                        <Route path='/verify' element={<Verify />} />
                    </Route>
                    <Route element={<Protected user={user} verified={verified} />}>
                        <Route path='/collection' element={<Collection search={search} />} />
                        <Route path='/collection/:page' element={<Collection search={search} />} />
                        <Route path='/collection/:query/:page' element={<Collection search={search} />} />
                        {/* <Route path='/API' element={<API />} /> */}
                        <Route path='/settings' element={<Settings isUser={user} />} />
                    </Route>
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </main>
        </>
    )
}
export default App