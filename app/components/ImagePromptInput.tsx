"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";
import { Input } from "./ui/input";

interface ImagePromptInputProps {
  onSubmit: (prompt: string, backstory: string, artStyle: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function ImagePromptInput({
  onSubmit,
  isEditing,
  isLoading,
}: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [backstory, setBackstory] = useState("");

  const artStyles = [
    "Default",
    "Pixel Art",
    "Watercolor",
    "3D Render",
    "Anime",
    "Sketch",
    "Cartoon",
  ];
  
  const [artStyle, setArtStyle] = useState("Default");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim(), backstory.trim(), artStyle);
      setPrompt("");
      setBackstory("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg font-courier-prime text-black"
    >
      {/* Prompt */}
      <div className="space-y-2">
        <p className="text-md font-bold text-black">
          {isEditing
            ? "Describe how you want to edit the image"
            : "Describe the image you want to generate"}
        </p>
        <Input
          id="prompt"
          className="border border-black text-black bg-white placeholder-gray-500"
          placeholder={
            isEditing
              ? "Example: Make the background blue and add a rainbow..."
              : "Example: A 3D rendered pig with wings flying over a futuristic city..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Art Style */}
      <div className="space-y-2">
        <p className="text-md font-bold text-black">Art Style</p>
        <select
          value={artStyle}
          onChange={(e) => setArtStyle(e.target.value)}
          className="w-full border border-black rounded-md p-2 bg-white text-black"
        >
          {artStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {/* Backstory */}
      <div className="space-y-2">
        <p className="text-md font-bold text-black">
          {isEditing
            ? "Describe how you want to edit the backstory"
            : "Describe the backstory of the pet"}
        </p>
        <Input
          id="backstory"
          className="border border-black text-black bg-white placeholder-gray-500"
          placeholder={
            isEditing
              ? "Example: The pig is now a superhero with a cape..."
              : "Example: The fish's name is Goldie and it has short-term memory disorder..."
          }
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full bg-[#C9C9AA] text-black font-pixelify hover:bg-[#C9C9AA]/80 disabled:opacity-50"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {isEditing ? "Edit Image" : "Generate Image"}
      </Button>
    </form>
  );
}
