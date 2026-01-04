import { useEffect } from 'react'
import type { FC, KeyboardEvent } from 'react'
import { Link, useLocation, matchPath } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import LOGOUT from '@features/auth/mutations/Logout'
import type LogoutMutation from '@type/graphql/layouts/navbar'
import { useSelector, useDispatch } from 'react-redux'
import { setActive, setIsDropdownOpen } from '@store/slices/layouts/navbar'
import type { RootState } from '@store/store'
import type NavbarProps from '@type/components/layouts/navbar'

const Navbar: FC<NavbarProps> = ({ isUser, onSearch }) => {
    const { pathname } = useLocation()
    const match =
        matchPath('/search/:query/:page', pathname) ??
        matchPath('/collection/:page', pathname) ??
        matchPath('/collection/:query/:page', pathname)
    const query = match?.params && 'query' in match.params ? (match.params.query) as string : ''
    const [logout] = useMutation<LogoutMutation>(LOGOUT)
    const dispatch = useDispatch()
    const navbarState = useSelector((state: RootState) => state.navbar)
    const { active, isDropdownOpen } = navbarState
    useEffect(() => {
        if (pathname === '/' || pathname.startsWith('/search/')) dispatch(setActive('home'))
        if (pathname === '/collection' || pathname.startsWith('/collection/')) dispatch(setActive('col'))
        else if (pathname === '/API') dispatch(setActive('api'))
    }, [])
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSearch(e.currentTarget.value)
    }
    const imgFormat = (base64String: string) => {
        const decodedString = atob(base64String)
        const hexString = Array.from(decodedString).map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('')
        if (decodedString.trim().startsWith('<?xml') || decodedString.trim().startsWith('<svg')) return 'svg+xml'
        else if (hexString.startsWith('FFD8FF')) return 'jpeg'
        else if (hexString.startsWith('89504E470D0A1A0A')) return 'png'
        else if (hexString.startsWith('474946383761') || hexString.startsWith('474946383961')) return 'gif'
        return
    }
    const handleLogOut = async () => {
        try {
            const { data } = await logout()
            if (data!.logout) location.href = '/'
        } catch (err) {
            if (err instanceof Error) alert(err.message)
            else alert('An unexpected error occurred.')
        }
    }
    return (
        <nav className="flex flex-wrap justify-between items-center p-4 md:px-7 h-auto bg-[#282820] w-full fixed top-0 left-0 z-50 shadow-md">
            <div className="text-white">
                {isUser ? (
                    <div className="flex flex-wrap space-x-4">
                        <Link to="" className={`${active === 'home' ? 'text-gray-500' : 'hover:text-gray-500'} mr-4`} onClick={() => dispatch(setActive('home'))}>Home</Link>
                        <Link to="collection" className={`${active === 'col' ? 'text-gray-500' : 'hover:text-gray-500'} mr-4`} onClick={() => dispatch(setActive('col'))}>Collection</Link>
                        {/* <Link to="API" className={`${active === 'api' ? 'text-gray-500' : 'hover:text-gray-500'}`} onClick={() => dispatch(setActive('api'))}>API</Link> */}
                    </div>
                ) : (
                    <Link to="" className='text-gray-500'>Home</Link>
                )}
            </div>
            {active !== 'api' && (
                <input placeholder={active === 'home' ? 'Search Title or ISBN (without "-" or spaces)' : 'Search Title'} className="bg-white w-full md:w-[25vw] p-2 rounded-full mt-2 md:mt-0" defaultValue={query ? query.replace(/\++/g, ' ') : ''} onKeyDown={handleKeyDown} />
            )}
            <div className="w-full flex flex-col items-center mt-4 md:mt-0 md:w-auto md:flex-row md:justify-end">
                {isUser ? (
                    <>
                        <span className="hidden md:inline text-white mr-4">{isUser.name}</span>
                        <img src={`data:image/${imgFormat(isUser.photo)};base64,${isUser.photo}`} alt="Image" className="rounded-full w-12 h-12 mx-auto cursor-pointer" onClick={() => dispatch(setIsDropdownOpen(!isDropdownOpen))} />
                        {isDropdownOpen && (
                            <div className="absolute top-12 right-0 bg-white text-black shadow-md rounded-md w-40">
                                <ul>
                                    <li className="p-2 hover:bg-gray-200 cursor-pointer"><a href="settings">Settings</a></li>
                                    <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogOut}>Log Out</li>
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <a href="register" className="hover:text-gray-500 mr-4 text-white">Register</a>
                        <a href="login" className="hover:text-gray-500 text-white">Already have an account?</a>
                    </>
                )}
            </div>
        </nav>
    )
}
export default Navbar