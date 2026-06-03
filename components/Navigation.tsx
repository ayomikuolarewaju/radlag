'use client'
// components/Navigation.tsx

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const NAV_LINKS = [
  { name: 'Home',          href: '/' },
  { name: 'Events',        href: '/events' },
  { name: 'Jobs',          href: '/jobs' },
  { name: 'Gallery',       href: '/gallery' },
  { name: 'Dues',          href: '/dues' },
  { name: 'Announcements', href: '/announcements' },
  { name: 'Members',       href: '/members' },
  { name: 'Birthdays',     href: '/birthdays' },
  { name: 'Tutorials',     href: '/tutorials' },
]

function cls(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation() {
  const pathname = usePathname()
  const { member, logout } = useMembershipAuth()

  const isAdmin = member?.membership_number === 'ADMIN001'

  return (
    <Disclosure as="nav" className="bg-white shadow sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">

              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-amber-600 tracking-tight">
                    RADLAG
                  </Link>
                </div>
                {member && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                    {NAV_LINKS.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cls(
                          pathname === item.href
                            ? 'border-amber-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cls(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                      pathname.startsWith('/admin')
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    )}
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                {member ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                      <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-semibold text-sm">
                        {member.full_name?.charAt(0) || 'M'}
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{member.email}</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link href="/profile" className={cls(active ? 'bg-gray-50' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                              My Profile
                            </Link>
                          )}
                        </Menu.Item>
                        {isAdmin && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link href="/admin" className={cls(active ? 'bg-gray-50' : '', 'block px-4 py-2 text-sm text-amber-700 font-medium')}>
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={cls(active ? 'bg-gray-50' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link href="/login" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                    Log in →
                  </Link>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100">
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden border-t border-gray-100">
            <div className="space-y-1 pb-3 pt-2">
              {member && NAV_LINKS.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cls(
                    pathname === item.href
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="block border-l-4 border-amber-500 bg-amber-50 py-2 pl-3 pr-4 text-base font-medium text-amber-700">
                  ⚙ Admin Dashboard
                </Link>
              )}
              {member ? (
                <button onClick={logout} className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50">
                  Sign out
                </button>
              ) : (
                <Link href="/login" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-amber-600">
                  Log in
                </Link>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
