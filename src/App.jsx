import React, { useRef, useState } from "react"
import { useEffect } from "react";
import NumInput from "./NumInput";

const initialFormat = {
  exp: 8,
  frac: 23,
};

function computeExp(exponentBits) {
  let result = 0;
  for (let i = 0; i < exponentBits.length; i++) {
    if (exponentBits[i] === 1)
      result += Math.pow(2, exponentBits.length - 1 - i);
  }
  return result;
}

function computeFrac(fracBits) {
  let result = 0;
  for (let i = 0; i < fracBits.length; i++) {
    if (fracBits[i] === 1)
      result += Math.pow(2, -(i + 1));
  }
  return result;
}

function isAllOnes(bitStr) {
  for (let i = 0; i < bitStr.length; i++) {
    if (bitStr[i] === 0)
      return false;
  }
  return true;
}

function computeFloatingPoint(signBit, exponentBits, fracBits) {
  let denorm = false;
  const bias = Math.pow(2, exponentBits.length - 1) - 1;
  const exp = computeExp(exponentBits);

  let E = exp - bias;
  if (exp === 0) {
    E = 1 - bias;
    denorm = true;
  }

  //console.log(exponentBits)
  const frac = computeFrac(fracBits);
  if (isAllOnes(exponentBits)) {

    if (frac !== 0)
      return NaN;

    if (signBit)
      return -Infinity;

    return Infinity;
  }

  let result = Math.pow(-1, signBit) * Math.pow(2, E) * (1 + frac);
  if (denorm)
    result = Math.pow(-1, signBit) * Math.pow(2, E) * frac;

  if (result === Infinity)
    return "Number is too high."

  return result;
}

function getResizedArr(arr, size) {
  let newArr = [];
  if (arr.length > size) {
    newArr = arr.slice(-size); // truncate the array from the left
  } else if (arr.length < size) {
    newArr = Array(size - arr.length).fill(0).concat(arr); // pad the array with 0s from the left
  }
  return newArr;
}

function getBinaryRep(signBit, exponentBits, fracBits) {
  let result = `${signBit ? 1 : 0}`;
  exponentBits.forEach(bit => {
    result += bit;
  })

  fracBits.forEach(bit => {
    result += bit;
  })

  return result;
}

// function getEfromExp(exp) {
//   for (let i = 0; i < exp.length; i++) {
//     if (exp[i] === 1)
//       return exp.length - i - 1;
//   }
// }


function App() {

  const [exponentBits, setExponentBits] = useState(Array(initialFormat.exp).fill(0))
  const [fracBits, setFracBits] = useState(Array(initialFormat.frac).fill(0))
  const [signBit, setSignBit] = useState(0);
  const [value, setValue] = useState(computeFloatingPoint(signBit, exponentBits, fracBits));

  // function getBinaryRepFromDecialRep(value) {
  //   const sign = !(value - value === 0);
  //   const intPart = Math.abs(parseInt(value));
  //   const fracPart = Math.abs(value) - intPart;

  //   const bias = Math.pow(2, exponentBits.length - 1) - 1;
  //   const binFracPart = fracPart.toString(2);
  //   const binExpPart = (getEfromExp(intPart.toString(2).split("")) + bias).toString(2);

  //   const expArr = binExpPart.split("").map((char) => parseInt(char, 2));

  //   let fracArr = binFracPart.split("").slice(2)
  //   fracArr = intPart.toString(2).split("").slice(1).concat(fracArr)

  //   if (fracArr.length > fracBits.length) {
  //     fracArr.splice(fracBits.length);
  //   } else if (fracArr.length < fracBits.length) {
  //     const numFillChars = fracBits.length - fracArr.length;
  //     const fillArray = new Array(numFillChars).fill("0");
  //     fracArr = fracArr.concat(fillArray);
  //   }

  //   fracArr = fracArr.map((char) => parseInt(char, 2));


  //   console.log(getEfromExp(intPart.toString(2).split("")) + bias)

  //   setExponentBits([...expArr])
  //   setFracBits([...fracArr])
  //   setSignBit(sign)

  // }

  //const [decimalInput, setDecimalInput] = useState(0)
  const decimalInputRef = useRef(null)

  // function handleDecimalInput(e) {
  //   const value = parseFloat(e.target.value);
  //   if (isNaN(value))
  //     return;
    
  //   setDecimalInput(value)
  //   getBinaryRepFromDecialRep(value)
  // }


  function setExp(size) {
    setExponentBits([...getResizedArr(exponentBits, size)])
  }

  function setFrac(size) {
    setFracBits([...getResizedArr(fracBits, size)])
  }

  function setExpBit(index, val) {
    const newExponentBits = exponentBits;
    newExponentBits[index] = val;
    setExponentBits([...newExponentBits])
  }

  function setFracBit(index, val) {
    const newFracBits = fracBits;
    newFracBits[index] = val;
    setFracBits([...newFracBits])
  }

  useEffect(() => {
    setValue(computeFloatingPoint(signBit, exponentBits, fracBits))
  }, [exponentBits, fracBits, signBit])

  useEffect(() => {
    if(decimalInputRef.current === document.activeElement)
      return

  }, [value])

  return (
    <div className="h-screen w-screen flex justify-center items-center select-none">
      <div className="flex flex-col justify-center items-center bg-slate-100 w-2/3 h-1/2">
        <div className="flex flex-row-reverse items-center justify-around w-5/6 mb-8">
          <div className="w-max">
            <div className="">
              <p className="font-bold mr-2">Decimal:</p>
              <p>{value}</p>
            </div>
            <div className="">
              <p className="font-bold mr-2">Binary Representation:</p>
              <p className="">{getBinaryRep(signBit, exponentBits, fracBits)}</p>
            </div>
          </div>
          <div className="">
            <div>
              <p>Exponent Bits</p>
              <NumInput value={exponentBits.length} onChange={setExp} min={1} max={43}></NumInput>
            </div>
            <div>
              <p>Frac Bits</p>
              <NumInput value={fracBits.length} onChange={setFrac} min={1} max={50}></NumInput>
            </div>

          </div>
        </div>
        <div className="w-5/6 h-8 flex justify-center items-center flex-wrap">
          <div className="w-max h-12 bg-yellow-300 px-2 m-1">
            <div>
              <p className="text-center">Sign</p>
              <div className="flex justify-center">
                <input onChange={() => setSignBit(signBit ? 0 : 1)} checked={signBit} type="checkbox"></input>
              </div>
            </div>
          </div>
          <div className="w-max h-12 bg-blue-300 px-2 m-1">
            <div>
              <p className="text-center">Exponent</p>
              <div className="flex justify-center flex-wrap">
                {exponentBits.map((bit, index) => {
                  return (
                    <input className="mx-1" onChange={() => setExpBit(index, bit ? 0 : 1)} checked={bit} type="checkbox"></input>
                  )
                })

                }
              </div>
            </div>
          </div>

          <div className="w-max h-12 bg-red-300 px-2 m-1">
            <div >
              <p className="text-center">Frac</p>
              <div className="flex justify-center flex-wrap">
                {fracBits.map((bit, index) => {
                  return (
                    <input className="mx-1" onChange={() => setFracBit(index, bit ? 0 : 1)} checked={bit} type="checkbox"></input>
                  )
                })

                }
              </div>
            </div>
          </div>


        </div>


      </div>
    </div>
  );
}

export default App;
