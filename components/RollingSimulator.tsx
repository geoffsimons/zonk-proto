import { DieStatus } from "@/model/state";
import useGameStore from "@/model/useGameStore";
import { useEffect } from "react";

export default function RollingSimulator() {
  const { dice, setDiceStatus, setDieValue } = useGameStore();

  useEffect(() => {
    const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);

    if (rollingDice.length > 0) {
      rollingDice.forEach((die) => {
        const newVal = Math.floor(Math.random() * 6) + 1;
        setDieValue(die.id, newVal);
        setDiceStatus([die.id], DieStatus.RESTING);
      });
    }
  }, [dice, setDieValue, setDiceStatus]);

  return (
    <></>
  );
}

