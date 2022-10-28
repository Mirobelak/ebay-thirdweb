import React from 'react'
import {useAddress, useDisconnect, useMetamask} from "@thirdweb-dev/react"
import Link from 'next/link'
import {BellIcon,ShoppingCartIcon,ChevronDownIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import Image from 'next/image'

type Props = {}

function Header({}: Props) {
    const connectWithMetamask = useMetamask()
    const disconnect = useDisconnect()
    const address = useAddress()
  return (
    <div className='max-w-6xl mx-auto p-2'>
        <nav className='flex justify-between'>
            <div className='flex items-center space-x-2 text-sm'>
                {address ? (
                    <div>
                        <p>Hi, {address.slice(0,6) + "..." + address.slice(-4)}</p>
                        <button className='connectWalletBtn' onClick={disconnect}>Disconnect</button>
                    </div>
                ) : (
                    <button className='connectWalletBtn' onClick={connectWithMetamask}>Connect with Metamask</button>
                )}

                <p  className="headerLink hover:link">Daily Deals</p>
                <p  className="headerLink hover:link">Contact</p>
            </div>
            <div className='flex items-center space-x-4 text-sm'>
                <p className='headerLink hover:link '>Ship to</p>
                <p className='headerLink hover:link'>Sell</p>
                <p className='headerLink hover:link'>Watchlist</p>
                <Link href="/addItem" className='flex items-center hover:link'>Add to inventory
                <ChevronDownIcon className='h-4' />
                </Link>
                <BellIcon className='h-6 w-6 hover:link' />
                <ShoppingCartIcon className='h-6 w-6 hover:link' />
            </div>
        </nav>

        <hr className='mt-2' />

        <section className='flex items-center space-x-2 py-5'>
            <div className='relative h-16 w-16 sm:w-28 md:w-44 cursor-pointer flex-shrink-0'>
            <Link href="/">
            <Image className='h-full w-full object-contain' src="https://links.papareact.com/bdb" alt="ThirdWebLogo" width={100} height={100} />
            </Link>
            </div>
            <button className='hidden lg:flex items-center space-x-2 w-20'>
                <p className='text-gray-600 text-sm'>Shop By Category</p>
                <ChevronDownIcon className='h-4 flex-shrink-0' />
            </button>
            <div className='flex items-center  space-x-2 px-2 md:px-5 py-2 border-black border-2 flex-1'>
                <MagnifyingGlassIcon className='h-6 w-6' />
                <input type='text' placeholder='Search for anything' className='flex-1 outline-none ' />
            </div>
            <button className='hidden sm:inline bg-blue-600 text-white px-5 md:px-10 py-2 border-2 border-blue-600'>Search</button>
            <Link href="/">
            <button className='border-2 border-blue-600 px-5 md:px-10 py-2 text-blue-600 hover:bg-blue-600/50 hover:text-white cursor-pointer'>List Item</button>
            </Link>
        </section>
        <hr />
        <section className='flex space-x-6 py-2 text-xs md:text-sm whitespace-nowrap justify-center px-6'>
            <p className="link">Home</p>
            <p className="link">Electronics</p>
            <p className="link">Computers</p>
            <p className="link hidden sm:inline">Video Games</p>
            <p className="link hidden sm:inline">Kitchen</p>
            <p className="link  hidden md:inline">Home</p>
            <p className="link  hidden lg:inline">Garden</p>
            <p className="link  hidden lg:inline">Health</p>
            <p className="link  hidden lg:inline">Beauty</p>
            <p className="link   hidden xl:inline">Toys</p>
            <p className="link   hidden xl:inline">Baby</p>
            <p className="link">More</p>
        </section>
    </div>
  )
}

export default Header