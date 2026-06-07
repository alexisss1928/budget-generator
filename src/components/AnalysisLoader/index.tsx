import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const phrases = [
  "Estructurando la información...",
  "Analizando los datos...",
  "Ya casi lo tenemos...",
  "Procesando la información...",
  "Organizando tu espacio..."
];

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const OuterRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-right-color: var(--accent);
  opacity: 0.8;
  animation: ${spin} 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
`;

const InnerRing = styled.div`
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: var(--accent);
  border-left-color: var(--accent);
  opacity: 0.6;
  animation: ${spin} 2s linear infinite reverse;
`;

const CorePulse = styled.div`
  width: 30%;
  height: 30%;
  background-color: var(--accent);
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 0 15px var(--accent);
`;

const PhraseText = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
  margin: 0;
  animation: ${pulse} 3.5s ease-in-out infinite;
  text-align: center;
  height: 24px;
`;

const AnalysisLoader = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500); // changes every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <LoaderContainer>
      <SpinnerWrapper>
        <OuterRing />
        <InnerRing />
        <CorePulse />
      </SpinnerWrapper>
      <PhraseText>{phrases[currentPhraseIndex]}</PhraseText>
    </LoaderContainer>
  );
};

export default AnalysisLoader;
