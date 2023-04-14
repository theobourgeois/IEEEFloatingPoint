import React, { useState, useRef } from "react"
import { useEffect } from "react";
import NumInput from "./NumInput";
import ClickAwayListener from 'react-click-away-listener';

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

function getBias(exponentBits) {
  return Math.pow(2, exponentBits.length - 1) - 1;
}

function computeFloatingPoint(signBit, exponentBits, fracBits) {
  let denorm = false;
  const bias = getBias(exponentBits);
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

function getEfromExp(exp) {
  console.log(exp)
  for (let i = 0; i < exp.length; i++) {
    if (parseInt(exp[i]) === 1)
      return exp.length - i - 1;
  }
}

function getE(exponentBits) {
  const exp = computeExp(exponentBits);
  const denorm = exp === 0;
  const bias = getBias(exponentBits);
  if(denorm)
    return 1 - bias;
  return exp - bias;
}

function getM(fracBits, exponentBits) {
  const denorm = computeExp(exponentBits) === 0 ? 0 : 1;
  const frac = computeFrac(fracBits);
  return denorm + frac;
}

function App() {

  const [exponentBits, setExponentBits] = useState(Array(initialFormat.exp).fill(0))
  const [fracBits, setFracBits] = useState(Array(initialFormat.frac).fill(0))
  const [signBit, setSignBit] = useState(0);
  const [value, setValue] = useState(computeFloatingPoint(signBit, exponentBits, fracBits));

  function getBinaryRepFromDecialRep(value, exponentBits, fracBits) {
    const sign = !(value - value === 0);
    const intPart = Math.abs(parseInt(value));
    const fracPart = Math.abs(value) - intPart;

    const bias = Math.pow(2, exponentBits.length - 1) - 1;
    const binFracPart = fracPart.toString(2);
    const binExpPart = (getEfromExp(intPart.toString(2).split("")) + bias).toString(2);

    const expArr = binExpPart.split("").map((char) => parseInt(char, 2));

    let fracArr = binFracPart.split("").slice(2)
    fracArr = intPart.toString(2).split("").slice(1).concat(fracArr)

    if (fracArr.length > fracBits.length) {
      fracArr.splice(fracBits.length);
    } else if (fracArr.length < fracBits.length) {
      const numFillChars = fracBits.length - fracArr.length;
      const fillArray = new Array(numFillChars).fill("0");
      fracArr = fracArr.concat(fillArray);
    }

    fracArr = fracArr.map((char) => parseInt(char, 2));

    setExponentBits([...expArr])
    setFracBits([...fracArr])
    setSignBit(sign)

  }

  function setExp(size) {
    const newExponentBits = getResizedArr(exponentBits, size);
    getBinaryRepFromDecialRep(value, newExponentBits, fracBits);
  }

  function setFrac(size) {
    const newFracBits = getResizedArr(fracBits, size)
    getBinaryRepFromDecialRep(value, exponentBits, newFracBits);
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
    const newValue = computeFloatingPoint(signBit, exponentBits, fracBits)
    setValue(newValue);
    decimalRef.current.value = newValue;
  }, [exponentBits, fracBits, signBit])

  const [editingDecimal, setEditingDecimal] = useState(false);
  const decimalRef = useRef(null);

  function finishEditingDecimal() {
    if(!editingDecimal)
      return;
    
    const value = parseFloat(decimalRef.current.value);
    if(isNaN(value)) {
      setEditingDecimal(false);
      return;
    }

    getBinaryRepFromDecialRep(value, exponentBits, fracBits);
    setEditingDecimal(false);
  }
  
  function toggleEditingDecimal(e) {
    e.stopPropagation();
    setEditingDecimal(true);

    
  }
  useEffect(()=>{
    if(editingDecimal)
      decimalRef.current.focus();
  }, [editingDecimal])

  function handleDecimalEnter(e) {
    if(e.keyCode === 13) {
      finishEditingDecimal();
    }
  }
 
  return (
    <div className="h-screen w-screen flex justify-center items-center ">
      <div className="flex flex-col justify-evenly items-center bg-slate-100 outline-gray-200 outline outline-1 w-2/3 h-max pt-12 pb-8 ">
        <div className="flex items-start justify-start w-5/6 mb-8 flex-1 flex-row-reverse max-xl:flex-col">
          <div className="w-max flex justify-center flex-1 flex-row max-md:flex-col">
            <div className="mr-8 h-40 w-24 flex-1 bg-slate-200 outline-gray-300 outline outline-1 p-4">
              <div className="">
                <p className="font-bold mr-2">Decimal:</p>
                <ClickAwayListener onClickAway={finishEditingDecimal}>
                    <input onKeyDown={handleDecimalEnter} ref={decimalRef} style={{display: editingDecimal ? "block" : "none"}}  type="text"></input>
                </ClickAwayListener>
                <p style={{display: editingDecimal ? "none" : "block"}} onClick={toggleEditingDecimal} className="rounded-sm translate-x-[-4px] px-1 hover:bg-slate-300">{value}</p>
              </div>
              <div className="">
                <p className="font-bold mr-2">Binary Representation:</p>
                <p className="break-words whitespace-normal rounded-sm">{getBinaryRep(signBit, exponentBits, fracBits)}</p>
              </div>
            </div>
            <div className="w-max bg-slate-200 p-4 outline-gray-300 outline outline-1">
              <div className="flex">
                <p className="font-bold mr-2">Exp:</p>
                <p className="">{computeExp(exponentBits)}</p>
              </div>
              <div className="flex">
                <p className="font-bold mr-2">Bias:</p>
                <p className="">{getBias(exponentBits)}</p>
              </div>
              <div className="flex">
                <p className="font-bold mr-2">E:</p>
                <p className="">{getE(exponentBits)}</p>
              </div>
              <div className="flex">
                <p className="font-bold mr-2">M:</p>
                <p className="">{getM(fracBits, exponentBits)}</p>
              </div>
            </div>
          </div>
          <div className="h-40  min-w-min select-none bg-slate-200 outline-gray-300 outline outline-1 p-4 mr-8 flex flex-col justify-start">
            <div className="flex justify-between mb-4 mt-2">
              <p className="font-bold">Exponent Bits</p>
              <NumInput value={exponentBits.length} onChange={setExp} min={1} max={11}></NumInput>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Frac Bits</p>
              <NumInput value={fracBits.length} onChange={setFrac} min={1} max={52}></NumInput>
            </div>
          </div>
        </div>
        <div className="w-5/6 p-4 h-48 bg-slate-200 outline-gray-300 outline outline-1 flex justify-center items-center flex-wrap select-none">
          <div className="w-max h-12 bg-yellow-300 outline-yellow-400 outline outline-1 px-2 m-1">
            <div>
              <p className="text-center">Sign</p>
              <div className="flex justify-center">
                <input onChange={() => setSignBit(signBit ? 0 : 1)} checked={signBit} type="checkbox"></input>
              </div>
            </div>
          </div>
          <div className="w-max h-12 bg-blue-300 outline-blue-400 outline outline-1 px-2 m-1">
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

          <div className="w-max h-12 bg-red-300 outline-red-400 outline outline-1 px-2 m-1">
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
