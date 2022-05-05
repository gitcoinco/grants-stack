import React from "react";

interface Props {
  children: JSX.Element
}

function Layout(ownProps: Props) {
  return <div>
    <header>
      HEADER
    </header>
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
