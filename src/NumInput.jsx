import React from "react";

export default function NumInput({value, onChange, min=null, max=null, step=1}) {
    function increment() {
        if(max == null) 
            return onChange(value + step)

        if(value + step > max)
            return;
        else
            onChange(value + step)
    }

    function decrement() {
        if(min == null) 
            return onChange(value - step)
        if(value - step < min)
            return;
        else
            onChange(value - step)
    }

    return (
        <div className="flex ml-1 outline-gray-300 outline outline-1">
            <div className="w-8 bg-white pl-1">{value}</div>
            <div>
                <div className="bg-neutral-300 hover:bg-neutral-400" onClick={increment}>
                    <svg className="scale-[0.4]" fill="#2F2F2F" xmlns="http://www.w3.org/2000/svg" width="20.116" height="11.746" viewBox="0 0 20.116 11.746">
                        <path id="Icon_awesome-sort-up" data-name="Icon awesome-sort-up" d="M19.617,15.75H2.883a1.69,1.69,0,0,1-1.2-2.883L10.055,4.5a1.681,1.681,0,0,1,2.384,0l8.367,8.367A1.686,1.686,0,0,1,19.617,15.75Z" transform="translate(-1.191 -4.004)"/>
                    </svg>
                </div>
                <div className="bg-neutral-300 hover:bg-neutral-400" onClick={decrement}>
                    <svg className="rotate-180 scale-[0.4]" fill="#2F2F2F" xmlns="http://www.w3.org/2000/svg" width="20.116" height="11.746" viewBox="0 0 20.116 11.746">
                        <path id="Icon_awesome-sort-up" data-name="Icon awesome-sort-up" d="M19.617,15.75H2.883a1.69,1.69,0,0,1-1.2-2.883L10.055,4.5a1.681,1.681,0,0,1,2.384,0l8.367,8.367A1.686,1.686,0,0,1,19.617,15.75Z" transform="translate(-1.191 -4.004)"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}

