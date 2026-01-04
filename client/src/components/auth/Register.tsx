import { useEffect } from 'react'
import type { FC, ChangeEvent, FormEvent } from 'react'
import { CombinedGraphQLErrors } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import REGISTER from '@features/auth/mutations/Register'
import type RegisterMutation from '@type/graphql/auth/register'
import { useSelector, useDispatch } from 'react-redux'
import { setAccessToken } from '@store/slices/core/app'
import { change, setShow, setErrors } from '@store/slices/auth/register'
import type { RootState } from '@store/store'

const Register: FC = () => {
    const [register, { loading }] = useMutation<RegisterMutation>(REGISTER)
    const dispatch = useDispatch()
    const registerState = useSelector((state: RootState) => state.register)
    const { name, username, email, pass, rePass, show, errors } = registerState
    useEffect(() => {
        const googleHandler = (e: MessageEvent) => {
            const { message } = e.data
            if (message === '') location.href = '/'
            else if (message) alert(message)
        }
        window.addEventListener('message', googleHandler)
        return () => window.removeEventListener('message', googleHandler)
    }, [])
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        dispatch(change({ name, value }))
        dispatch(setErrors({ ...errors, [name]: '' }))
    }
    const toggle = () => dispatch(setShow(!show))
    const submit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const { data } = await register({
                variables: {
                    name,
                    username,
                    email,
                    pass,
                    rePass: show ? null : rePass,
                    show,
                    identity: {
                        tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                        screenRes: `${window.screen.width}x${window.screen.height}`,
                        colorDepth: String(window.screen.colorDepth),
                        devicePixelRatio: String(window.devicePixelRatio || 1),
                        touchSupport: ('ontouchstart' in window).toString(),
                        hardwareConcurrency: String(navigator.hardwareConcurrency || '')
                    }
                }
            })
            if (data!.register) {
                dispatch(setAccessToken(data!.register))
                location.href = '/verify'
            }
        } catch (e) {
            if (e instanceof CombinedGraphQLErrors) {
                const { errors } = e.errors[0]!.extensions as { errors: Record<string, string> }
                dispatch(setErrors(errors))
            } else alert('An unexpected error occurred.')
        }
    }
    const googleRegister = () => {
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        const identity = {
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            screenRes: `${window.screen.width}x${window.screen.height}`,
            colorDepth: String(window.screen.colorDepth),
            devicePixelRatio: String(window.devicePixelRatio || 1),
            touchSupport: ('ontouchstart' in window).toString(),
            hardwareConcurrency: String(navigator.hardwareConcurrency || '')
        }
        const encoded = encodeURIComponent(btoa(JSON.stringify(identity)))
        window.open(`http://${import.meta.env['VITE_DOMAIN']}:${import.meta.env['VITE_SERVER_PORT']}/auth/google/register?identity=${encoded}`, '_blank', `width=${width},height=${height},left=${left},top=${top}`)
    }
    return (
        <div className="bg-black flex justify-center items-center h-screen">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
                <h1 className="flex justify-center text-2xl font-semibold mb-4">Register</h1>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="text-md text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            className={`mt-1 p-2 border ${!errors.name ? 'border-gray-300' : 'border-red-500'} rounded-md w-full focus:outline-none focus:border-black`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-md text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={handleChange}
                            className={`mt-1 p-2 border ${!errors.username ? 'border-gray-300' : 'border-red-500'} rounded-md w-full focus:outline-none focus:border-black`}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-md text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className={`mt-1 p-2 border ${!errors.email ? 'border-gray-300' : 'border-red-500'} rounded-md w-full focus:outline-none focus:border-black`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-md text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={show ? "text" : "password"}
                                name="pass"
                                value={pass}
                                onChange={handleChange}
                                className={`mt-1 p-2 border ${!errors.pass ? 'border-gray-300' : 'border-red-500'} rounded-md w-full focus:outline-none focus:border-black`}
                            />
                            <button
                                type="button"
                                onClick={toggle}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                            >
                                {show ? (
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 2L22 22" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="3" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.pass && <p className="text-red-500 text-sm mt-1">{errors.pass}</p>}
                    </div>
                    {!show && (
                        <div className="mb-4">
                            <label className="text-md text-gray-700">Retype Password</label>
                            <input
                                type="password"
                                name="rePass"
                                value={rePass}
                                onChange={handleChange}
                                className={`mt-1 p-2 border ${!errors.rePass ? 'border-gray-300' : 'border-red-500'} rounded-md w-full focus:outline-none focus:border-black`}
                            />
                            {errors.rePass && <p className="text-red-500 text-sm mt-1">{errors.rePass}</p>}
                        </div>
                    )}
                    <button className="w-full bg-black text-white py-2 px-4 my-1 rounded-md" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
                    <button type="button" onClick={googleRegister} className="w-full bg-black text-white py-2 px-4 rounded-md">Register with Google</button>
                </form>
                <div className="mt-4 text-sm text-gray-700 text-center">
                    Already have an account? <a href="/login" className="font-medium text-black hover:text-black">Log In</a>
                </div>
            </div>
        </div>
    )
}
export default Register