"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Effect, pipe } from "effect";

type Props = {};

type Pokemon = {
  name: string;
  pictureUrl: string;
};

export default function PokemonGacha({}: Props) {
  const [myPokemon, setMyPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (myPokemon) {
      console.log("myPokemon is ", myPokemon);
    }
  }, [myPokemon]);

  const getRandomNumber = Effect.sync(() => Math.floor(Math.random() * 100));

  const getPokemon = (id: number) => {
    return Effect.tryPromise({
      try: () =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then((res) => res.json())
          .then((data) => parsePokemon(data)),
      catch: (unknown) => new Error("error fetching pokemon"),
    });
  };

  const parsePokemon = (data: any) => {
    const name = data.name;
    const pictureUrl = data.sprites.front_default;
    const pokemon: Pokemon = {
      name: name,
      pictureUrl: pictureUrl,
    };
    return pokemon;
  };

  const program = pipe(
    getRandomNumber,
    Effect.flatMap((n) => getPokemon(n))
  );

  const runGacha = useCallback(
    () => Effect.runPromise(program).then(setMyPokemon),
    [program]
  );

  return (
    <div className="flex flex-col w-screen">
      <span className="text-6xl font-bold text-center mt-10 mb-3">
        Try Random Pokemon Gacha Machine
      </span>
      <div className="flex">
        <div className="w-1/2 items-center border border-2 flex flex-col">
          <img src="/gachaMachine.jpeg" />
          <button
            className="w-full pt-3 pb-3 border border-2 text-2xl hover:bg-gray-300"
            onClick={runGacha}
          >
            Gacha!!
          </button>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center border border-2">
          {myPokemon ? (
            <div className="flex flex-col w-full items-center">
              <img className="w-[60%]" src={myPokemon.pictureUrl} />
              <span className="w-full text-4xl text-center">
                name : {myPokemon.name}
              </span>
            </div>
          ) : (
            <img className="w-1/2" src="/Pokeball.webp" />
          )}
        </div>
      </div>
    </div>
  );
}
