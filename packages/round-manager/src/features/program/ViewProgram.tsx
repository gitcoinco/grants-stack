import { useParams } from "react-router-dom";

export default function ViewProgram() {

  let params = useParams();
  
  return (
    <div className="App">
      <main style={{ padding: "1rem 0" }}>
        <h2>This is ViewProgram for program {params.id}.</h2>
      </main>
    </div>
  );
}