import { useParams } from "react-router-dom";

export default function ViewRound() {

  let params = useParams();
  
  return (
    <div className="App">
      <main style={{ padding: "1rem 0" }}>
        <h2>This is ViewRound for round {params.roundId}.</h2>
      </main>
    </div>
  );
}