import { Link } from 'react-router-dom';
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";

const NavBarLogo = (props: {url: string}) => {
 return (
  <div className="flex">
   <Link
    to={props.url}
    className="flex-shrink-0 flex items-center"
    data-testid={"home-link"}
   >
    <GitcoinLogo className="block h-8 w-auto" />
    <div className="hidden lg:block md:block">
     <span className="mx-6 text-grey-400">|</span>
     <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
    </div>
   </Link>
  </div>
 );
}

export default NavBarLogo;