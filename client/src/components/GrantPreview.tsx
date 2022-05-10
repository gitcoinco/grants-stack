// import { useEffect} from 'react'
import { FormInputs } from './CreateGrant'
import { Link } from 'react-router-dom'
import { mintGrant } from '../actions/grantNfts'
import { RootState } from '../reducers';
import {
  shallowEqual,
  useSelector,
  useDispatch,
} from 'react-redux';

function Loading({status}: { status: string }) {
  if (status === 'initiated') {
    return (
      <div style={{color: 'yellow'}}>Your transaction is pending! Hold tight, we will let you know once your grant has been created</div>
    )
  }
  return (
    <div style={{color: 'green'}}>Your grant has been created!</div>
  )
}

function GrantPreview({ grant, url }: { grant: FormInputs, url: string }) {
  const props = useSelector((state: RootState) => ({
    txStatus: state.grants.txStatus,
  }), shallowEqual);

  const dispatch = useDispatch();
  return (
    <>
      <div>Your grant data has been saved to IPFS! And can be accessed here: <a target="_blank" rel="noreferrer" href={url}>{url}</a></div>
      {!props.txStatus ? (
        <>
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
        </>
      ) : <Loading status={props.txStatus} />}
      <Link to="/">Return to home page</Link>
    </>
  )
}

export default GrantPreview;
