import React from 'react'
import Header from '../components/Header'
import {useAddress, useContract} from '@thirdweb-dev/react'
import Image from 'next/image'
import {useRouter} from 'next/router'
import toast, {
    Toaster
  } from 'react-hot-toast';

type Props = {}

const addItem = (props: Props) => {
    const {contract} = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, "nft-collection")
    const address = useAddress()
    const router = useRouter()
    const [prewiew, setPreview] = React.useState<string>()
    const [image, setImage] = React.useState<File>()  

    const mintNft = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!address || !contract) return
        if (!image) {alert ("Please select an image"); return}
        const target = e.target as typeof e.target & {
            name: {value: string}
            description: {value: string}
        }

        const metadata = {
            name: target.name.value,
            description: target.description.value,
            image: image // image URL or file
        }

        try {
            const tx = await contract.mintTo(address, metadata) 
            const receipt = tx.receipt
            const tokenId = tx.id
            const nft = await tx.data()
            toast.success("NFT minted successfully")
            router.push(`/`)
        }
        catch (error) {
            console.log(error)
        }
    }
        
  return (
    <div>
        <Toaster position='top-center'/>
        <Header/> 
        <main className='max-w-6xl mx-auto p-2'>
            <div className="flex flex-col card">
                <h1 className='text-2xl font-bold color-black'>Add an Item to the Marketplace</h1>
                <div className='flex flex-col py-3'>
                <h4 className='font-bold'>Item Details</h4>
                <p>By adding Item to marketplace, you are essentially minting NFT of the item into your wallet which we can then list for sale !</p>
                </div>
                <div className='flex space-x-3 w-full'>
                    <div className='w-1/4'>
                        <Image width={100} height={100} className='w-full h-full object-contain' src={prewiew || "https://links.papareact.com/ucj"} alt="item" />
                    </div>
                    <form onSubmit={mintNft} className='flex flex-col w-3/4'>
                        <div className='flex flex-col'>
                            <label htmlFor="name">Name of Item</label>
                            <input className='p-2 w-full' type="text" name="name" id="name" placeholder='Enter...' />
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor="name">Description</label>
                            <input className='p-2 w-full' type="text" name="description" id="description" placeholder='Enter...' />
                        </div>
                        <p>Image of Item</p>
                        <div className='flex items-center'>
                            <input onChange={(e) => {if(e.target.files?.[0]){
                                setPreview(URL.createObjectURL(e.target.files?.[0]))
                                setImage(e.target.files?.[0])
                            }}} className='bg-gray-300 border-2 border-black text-sm p-1' placeholder='Choose file' type="file" />
                        </div>
                        <div className='flex justify-end'>
                        <button className='text-center relative left-100 w-[150px] text-white p-2 bg-blue-600 rounded-full hover:opacity-90 hover:scale-105 transition-all' type='submit'>Add/Mint Item</button>
                        </div>
                    </form>
                </div>   
            </div>
        </main>
                

    </div>
  )
}

export default addItem