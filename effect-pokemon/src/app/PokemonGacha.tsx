"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Effect, pipe, Option } from "effect";

type Props = {};

type Pokemon = {
  name: string;
  pictureUrl: string;
};

export default function PokemonGacha({}: Props) {
  const [myPokemon, setMyPokemon] = useState<Option.Option<Pokemon>>(
    Option.none()
  );

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
    const pokemon: Option.Option<Pokemon> = Option.some({
      name: name,
      pictureUrl: pictureUrl,
    });
    return pokemon;
  };

  const program = pipe(
    getRandomNumber,
    Effect.flatMap((n) => getPokemon(n))
  );

  const runGacha = useCallback(
    () =>
      Effect.runPromise(program)
        .then(setMyPokemon)
        .catch((e) => {
          console.log(e);
          setMyPokemon(Option.none());
        }),
    [program]
  );

  return (
    <div className="flex flex-col w-screen h-screen">
      <span className="text-6xl font-bold text-center mt-10 mb-3">
        Try Random Pokemon Gacha Machine
      </span>
      <div className="flex h-full">
        <div className="w-1/2 items-center border border-2 flex flex-col">
          <img className="w-auto h-[80%]" src="/gachaMachine.jpeg" />
          <button
            className="w-1/2 py-3 border border-2 rounded-lg text-2xl hover:bg-gray-300"
            onClick={runGacha}
          >
            Gacha!!
          </button>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center border border-2">
          {Option.match(myPokemon, {
            onNone: () => <img className="w-1/2" src="/Pokeball.webp" />,
            onSome: (pokemon) => (
              <div className="flex flex-col items-center w-full">
                <span className="w-full text-4xl text-center">
                  Congratulation!! <br /> You get a {pokemon.name}.
                </span>
                <img className="w-[60%]" src={pokemon.pictureUrl} />
              </div>
            ),
          })}
        </div>
      </div>
    </div>
  );
}
