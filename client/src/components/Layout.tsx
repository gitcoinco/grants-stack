import React from "react";
import { Header } from './Header'

interface Props {
  children: JSX.Element
}

function Layout(ownProps: Props) {
  return <div>
    <Header />
    <hr />

    <main>
      {ownProps.children}
    </main>

    <hr />
    <footer>
      FOOTER
    </footer>
  </div>;
}

export default Layout;
