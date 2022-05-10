// import { useEffect} from 'react'
import { FormInputs } from './CreateGrant'
import { Link } from 'react-router-dom'
import { mintGrant } from '../actions/grantNfts'
import { useDispatch } from 'react-redux';

function GrantPreview({ grant, url }: { grant: FormInputs, url: string }) {
  const dispatch = useDispatch();
  return (
    <>
      <div>Your grant data has been saved to IPFS! And can be accessed here: <a target="_blank" rel="noreferrer" href={url}>{url}</a></div>
      <div>This is the data associated with your grant: { Object.entries(grant).map(([key, value]) => {
        if (key === 'receivedFunding') {
          return (
            <p key={key}>{key}: {value ? 'Yes': 'No'}</p>
          )
        } 
        return (
          <p key={key}>{key}: {value}</p>
        )
      }) }</div>
      <div>Does everything look good?</div>
      <button onClick={e => dispatch(mintGrant())}>
        Create Grant
      </button>

      <Link to="/">Return to home page</Link>
    </>
  )
}

export default GrantPreview;
