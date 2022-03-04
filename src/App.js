import { useState } from 'react';

import './App.css';

const App = () => {
  const [file, setFile] = useState();
  const [finalResult, setFinalResult] = useState();

  const changeHandler = (e) => {
    setFile(e.target.files[0]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const input = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const data = csvToArray(text);

      const overlap = (e1d1, e1d2, e2d1, e2d2) => {
        const startDate1 = new Date(e1d1);
        const endDate1 = e1d2 == null ? new Date() : new Date(e1d2);
        const startDate2 = new Date(e2d1);
        const endDate2 = e2d2 == null ? new Date() : new Date(e2d2);

        const start = startDate1 < startDate2 ? startDate2 : startDate1;
        const end = endDate1 < endDate2 ? endDate1 : endDate2;

        if (end >= start) {
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        }

        return 0;
      };

      const result = data.reduce((acc, el) => {
        let c = acc[el[1]];
        if (!c) {
          c = acc[el[1]] = {
            overlap: 0,
            e1: 0,
            e2: 0,
            data: [],
          };
        }

        c.data.forEach((d) => {
          const o = overlap(d[2], d[3], el[2], el[3]);
          if (o > c.overlap) {
            c.overlap = o;
            c.e1 = d[0];
            c.e2 = el[0];
          }
        });

        c.data.push(el);
        return acc;
      }, {});

      const deObjectify = Object.entries(result).map(
        ([projectId, { e1, e2, overlap }]) => ({ e1, e2, projectId, overlap })
      );

      setFinalResult(deObjectify);
    };
    reader.readAsText(input);
  };

  const csvToArray = (str, delimiter = ",") => {
    const rows = JSON.parse(
      JSON.stringify(str.slice(str.indexOf("\n") + 1).split("\n")).replace(/\\r/g, "\r").replace(/\s+/g, "")
    );

    const arr = rows.map((row) => {
      const values = row.split(delimiter);
      return values;
    });
    return arr;
  };

  const displayItems = finalResult && finalResult.map(({ e1, e2, projectId, overlap }) => <tr key={Math.random()}><td>{e1}</td><td>{e2}</td><td>{projectId}</td><td>{overlap}</td></tr>)

  return (
    <div className="App">
      <form id="myForm" onSubmit={submitHandler}>
        <input type="file" id="csvFile" accept=".csv" onChange={changeHandler} />
        <br />
        <input type="submit" value="Submit" />
      </form>
      <table>
        <thead><tr><th>Employee ID #1</th>
          <th>Employee ID #2</th>
          <th>Project ID</th>
          <th>Days worked</th></tr>
        </thead>
        <tbody>
          {displayItems}
        </tbody>
      </table>
    </div>
  );
}

export default App;
