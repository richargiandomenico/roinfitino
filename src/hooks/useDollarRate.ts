import { useState, useEffect } from 'react';

export function useDollarRate() {
  const [rate, setRate] = useState<number>(5.50);
  const [euroRate, setEuroRate] = useState<number>(6.10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
        .then(res => res.json())
        .then(data => {
          const bid = parseFloat(data.USDBRL?.bid);
          if (!isNaN(bid)) setRate(bid);
        })
        .catch(() => {}),
      fetch('https://economia.awesomeapi.com.br/json/last/EUR-BRL')
        .then(res => res.json())
        .then(data => {
          const bid = parseFloat(data.EURBRL?.bid);
          if (!isNaN(bid)) setEuroRate(bid);
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return { rate, euroRate, loading };
}
