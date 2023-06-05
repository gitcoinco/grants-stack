interface Props {
  height: number
  images: string[]
}

const CollectionBanner = ({ height, images }: Props) => {
  return (<div className={`w-full grid grid-rows-4 h-[${height}px]`}>
    {images.map((i) => <div key={i} className={`h-[${height / 4}px] flex items-center justify-center overflow-hidden`}>
      <img src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${i}`} className={`w-full object-cover`} />
    </div>)}
  </div>)
}

export default CollectionBanner
