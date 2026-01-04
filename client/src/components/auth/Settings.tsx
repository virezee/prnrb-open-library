import { useEffect, useRef } from 'react'
import type { FC, ChangeEvent, FormEvent } from 'react'
import { CombinedGraphQLErrors } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { SETTINGS, TERMINATE } from '@features/auth/mutations/Settings'
import type { SettingsMutation, TerminateMutation } from '@type/graphql/auth/settings'
import { useSelector, useDispatch } from 'react-redux'
import { setIsDropdownOpen, change, setShow, setErrors } from '@store/slices/auth/settings'
import type { RootState } from '@store/store'
import type SettingsProps from '@type/components/auth/settings'

const Settings: FC<SettingsProps> = ({ isUser }) => {
    const [settings, { loading: settingsLoad }] = useMutation<SettingsMutation>(SETTINGS)
    const [terminate, { loading: terminateLoad }] = useMutation<TerminateMutation>(TERMINATE)
    const dispatch = useDispatch()
    const settingsState = useSelector((state: RootState) => state.settings)
    const { isDropdownOpen, photo, name, username, email, oldPass, newPass, rePass, show, errors } = settingsState
    useEffect(() => {
        const googleHandler = (e: MessageEvent) => {
            const { message } = e.data
            if (message === '') location.href = '/settings'
            else if (message) alert(message)
        }
        dispatch(change({ name: 'photo', value: isUser.photo }))
        dispatch(change({ name: 'name', value: isUser.name }))
        dispatch(change({ name: 'username', value: isUser.username }))
        dispatch(change({ name: 'email', value: isUser.email }))
        window.addEventListener('message', googleHandler)
        return () => window.removeEventListener('message', googleHandler)
    }, [])
    const inputFileRef = useRef<HTMLInputElement>(null)
    const imgFormat = (base64String: string) => {
        const decodedString = atob(base64String)
        const hexString = Array.from(decodedString).map(char => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('')
        if (decodedString.trim().startsWith('<?xml') || decodedString.trim().startsWith('<svg')) return 'svg+xml'
        else if (hexString.startsWith('FFD8FF')) return 'jpeg'
        else if (hexString.startsWith('89504E470D0A1A0A')) return 'png'
        else if (hexString.startsWith('474946383761') || hexString.startsWith('474946383961')) return 'gif'
        return
    }
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0]
        if (!file) return
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const base64String = reader.result!.toString().split(',')[1]
            const format = imgFormat(base64String!)
            if (format) dispatch(change({ name: 'photo', value: base64String! }))
            else alert('Invalid file format. Please upload an JPG/JPEG, PNG, GIF, or SVG image!')
        }
        dispatch(setErrors({ ...errors, photo: '' }))
    }
    const removeImage = () => {
        const initials = name.split(' ').map((w: string) => w.charAt(0).toUpperCase()).slice(0, 5).join('')
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
            <circle cx="256" cy="256" r="256" fill="#000" />
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Times New Roman" font-size="128" fill="white">${initials}</text>
        </svg>`
        dispatch(change({ name: 'photo', value: btoa(svg) }))
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        dispatch(change({ name, value }))
        dispatch(setErrors({ ...errors, [name]: '' }))
    }
    const toggle = (name: 'old' | 'new') => dispatch(setShow({ ...show, [name]: !show[name] }))
    const googleConnect = () => {
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        window.open(`http://${import.meta.env['VITE_DOMAIN']}:${import.meta.env['VITE_SERVER_PORT']}/auth/google/connect`, '_blank', `width=${width},height=${height},left=${left},top=${top}`)
    }
    const submit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const { data } = await settings({
                variables: {
                    photo,
                    name,
                    username,
                    email,
                    oldPass,
                    newPass,
                    rePass: show['new'] ? null : rePass,
                    show: show['new']
                }
            })
            if (data!.settings) {
                alert('Changes saved!')
                location.href = '/'
            }
        } catch (e) {
            if (e instanceof CombinedGraphQLErrors) {
                const { errors } = e.errors[0]!.extensions as { errors: Record<string, string> }
                dispatch(setErrors(errors))
            } else alert('An unexpected error occurred.')
        }
    }
    const handleDeleteAccount = async () => {
        try {
            const { data } = await terminate()
            if (data!.terminate) {
                alert('Account deleted!')
                location.href = '/'
            }
        } catch (e) {
            if (e instanceof Error) alert(e.message)
            else alert('An unexpected error occurred.')
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-3xl font-extrabold text-center mb-4">Settings</h2>
                <form onSubmit={submit}>
                    <div className="relative flex justify-center mb-6">
                        <img src={`data:image/${imgFormat(photo)};base64,${photo}`} alt="Image" className="rounded-full w-72 h-72 cursor-pointer object-cover" onClick={() => dispatch(setIsDropdownOpen(!isDropdownOpen))} />
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif, image/svg+xml"
                            ref={inputFileRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {isDropdownOpen && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black shadow-md rounded-md w-40 z-50">
                                <ul className="text-center">
                                    <li
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            inputFileRef.current!.click()
                                            dispatch(setIsDropdownOpen(false))
                                        }}
                                    >
                                        Upload Image
                                    </li>
                                    <li
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            removeImage()
                                            dispatch(setIsDropdownOpen(false))
                                        }}
                                    >
                                        Remove Image
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    {errors.photo && <p className="text-red-500 text-sm mt-1 text-center">{errors.photo}</p>}
                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full p-2 border rounded-md mt-1"
                            value={name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full p-2 border rounded-md mt-1"
                            value={username}
                            onChange={handleChange}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full p-2 border rounded-md mt-1"
                            value={email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Change Password</label>
                        <div className="relative">
                            <input
                                type={show['old'] ? "text" : "password"}
                                name="oldPass"
                                placeholder="Old Password"
                                className="w-full p-2 border rounded-md mt-1"
                                value={oldPass}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => toggle('old')}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                            >
                                {show['old'] ? (
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
                        {errors.oldPass && <p className="text-red-500 text-sm mt-1">{errors.oldPass}</p>}
                        <div className="relative">
                            <input
                                type={show['new'] ? "text" : "password"}
                                name="newPass"
                                placeholder="New Password"
                                className="w-full p-2 border rounded-md mt-1"
                                value={newPass}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => toggle('new')}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                            >
                                {show['new'] ? (
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
                        {errors.newPass && <p className="text-red-500 text-sm mt-1">{errors.newPass}</p>}
                        {!show['new'] && (
                            <>
                                <input
                                    type="password"
                                    name="rePass"
                                    placeholder="Retype New Password"
                                    className="w-full p-2 border rounded-md mt-1"
                                    value={rePass}
                                    onChange={handleChange}
                                />
                                {errors.rePass && <p className="text-red-500 text-sm mt-1">{errors.rePass}</p>}
                            </>
                        )}
                    </div>
                    <button type="button" className="w-full p-2 bg-black text-white rounded-md mt-5" onClick={googleConnect}>
                        {isUser.google ? 'Disconnect from Google' : 'Connect to Google'}
                    </button>
                    <button className="w-full p-2 bg-black text-white rounded-md mt-2" disabled={settingsLoad}>
                        {settingsLoad ? 'Loading...' : 'Save Changes'}
                    </button>
                    <button type="button" className="w-full p-2 bg-red-500 text-white rounded-md mt-5" onClick={handleDeleteAccount} disabled={terminateLoad}>Delete Account</button>
                </form>
            </div>
        </div>
    )
}
export default Settings