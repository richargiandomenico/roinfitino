import { useState, useEffect } from 'react';

export function useDollarRate() {
  const [rate, setRate] = useState<number>(5.50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
      .then(res => res.json())
      .then(data => {
        const bid = parseFloat(data.USDBRL?.bid);
        if (!isNaN(bid)) setRate(bid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { rate, loading };
}
