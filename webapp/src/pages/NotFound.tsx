import { Link } from 'react-router-dom'
import { asset } from '../data/seed'
import { Page } from '../components/Shell'
import { Empty } from '../components/ui'

export function NotFound() {
  return (
    <Page narrow>
      <Empty
        icon={<img src={asset('cs-mark.svg')} alt="" width={30} />}
        title="This page wandered off"
        text="The link may be broken or the page may have moved. Let’s get you back to the stories."
        action={
          <Link to="/home" className="btn btn-primary btn-sm">
            Back to Home
          </Link>
        }
      />
    </Page>
  )
}
