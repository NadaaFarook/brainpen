"use client";

import LoadingDots from "@/components/loading-dots";
import parseJsonSse from "@beskar-labs/parse-json-sse";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [isJS, setToJquery] = useState(true);

  const generate = async () => {
    setOutput("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `<|endoftext|>/* I start with a blank HTML page, and incrementally modify it via <script> injection. Written for Chrome. */\n/* Command: Add \"Hello World\", by adding an HTML DOM node */\nvar helloWorld = document.createElement('div');\nhelloWorld.innerHTML = 'Hello World';\ndocument.body.appendChild(helloWorld);\n/* Command: Clear the page. */\nwhile (document.body.firstChild) {\n  document.body.removeChild(document.body.firstChild);\n}\n\n/* Command: ${text} in ${
          isJS ? "in javascript" : "in Jquery"
        } */\n`,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    await parseJsonSse<{
      id: string;
      object: string;
      created: number;
      choices?: {
        text: string;
        index: number;
        logprobs: null;
        finish_reason: null | string;
      }[];
      model: string;
    }>({
      data,
      onParse: (json) => {
        if (!json.choices?.length) {
          throw new Error("Something went wrong.");
        }

        const { text } = json.choices[0];
        console.log(text, "text");

        setOutput((prev) => prev + json.choices?.[0].text);
      },
      onFinish: () => {
        setLoading(false);
      },
    });
  };

  const examplePrompts = [
    `"Add a click event to an event"`,

    `"Create a function called 'addNumber' that adds two numbers"`,
  ];
  return (
    <div>
      {/* <div
        style={{
          boxShadow: "0px 0px 98px 28px rgba(255, 74, 74, 0.25)",
        }}
        className="h-20 w-20 rounded-full bg-easy-red"
      /> */}

      <h1 className="mt-8 font-display text-5xl leading-tight text-white">
        What <span className="text-easy-red underline">code snippet </span> do
        you need?
      </h1>

      <h2 className="mt-6 font-body text-xl text-white">
        Describe your code needs in detail to get the best answer .
      </h2>

      <h2 className="mt-6 font-body text-xl text-neutral-200">Examples</h2>
      <div className="mt-4 flex flex-row gap-2">
        {examplePrompts.map((e) => {
          return (
            <div
              className=" w-100 rounded-md bg-neutral-900 p-4"
              onClick={() => setText(e)}
            >
              <p className="text-white">{e}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-20 font-display text-3xl text-white">write here</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-4 w-full rounded-lg bg-almost-black p-4 font-body text-xl text-white outline-none"
      />

      <label className="relative mt-8 mb-8 inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={!isJS}
          onClick={(e) => {
            const target = e.target as any;
            setToJquery(target.checked);
          }}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-easy-red peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-almost-easy-red dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-easy-red"></div>
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Code in Jquery
        </span>
      </label>
      <button
        onClick={generate}
        disabled={loading}
        className={`text-md mt-8 flex h-14 items-center justify-center rounded-full bg-easy-red p-4 px-10 font-display text-white outline-none
       
        ${loading ? "cursor-not-allowed" : "cursor-pointer"}
        ${!loading && "hover:bg-white hover:text-easy-red"}
       `}
      >
        {loading ? (
          <LoadingDots color="white" />
        ) : (
          <p>make magic happen in Jquery ✨</p>
        )}
      </button>

      {output && (
        <div className="mt-20 ">
          <p className="font-display text-3xl text-white ">output</p>
          <pre className="mt-12 w-full rounded-lg bg-almost-black p-6 font-body text-xl text-white">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
