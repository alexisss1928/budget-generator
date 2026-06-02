import styled from 'styled-components';
import professionalData from '../../commons/professionalData';

// ─── Legacy exports (used by sub-components) ──────────────────────────────────
// These are kept for Budget, Recipe, Report and similar components.
// New layout components are defined in App.tsx directly.

export const Wrapper = styled.div`
  height: 100vh;
  background: var(--bg);
  color: var(--text);
`;

export const Footer = styled.div`
  background-color: ${professionalData.primaryColor};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 12px;

  img {
    width: 80px;
  }
`;

export const LogoWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  & > * {
    flex: 1;
  }

  div:nth-child(2) {
    text-align: center;
  }

  button {
    margin-left: auto;

    img {
      margin-left: auto;
    }
  }

  div {
    img {
      width: 55px;
    }
  }

  div button {
    padding: 0;

    img {
      margin-left: auto;
      width: auto;
    }
  }
`;

export const SaveWrapper = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: ${professionalData.secondaryColor};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  border: none;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition-duration: 0.2s;
  box-shadow: 2px 2px 10px -5px #fff;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 60%;
    position: relative;
    left: 2px;
    filter: brightness(0) invert(1);
  }
`;

export const Menu = styled.div`
  position: relative;
  height: 60px;
  background-color: ${professionalData.primaryColor};
  color: #d4d4d4;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 10;

  h2 {
    margin: 20px;
  }
`;

export const Presupuesto = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100vw;
  max-width: 600px;
  padding: 30px;
  padding-bottom: 50px;
  height: calc(100vh - 130px);
  overflow: auto;
  background: var(--bg);
  color: var(--text);

  h3 {
    margin-top: 0;
    color: var(--text);
  }
`;

export const InputBox = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;

  label {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 4px;
  }

  input,
  select,
  textarea {
    margin-top: 5px;
    border: none;
    padding: 10px;
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text);
  }

  input[type='submit'] {
    background-color: ${professionalData.secondaryColor};
    color: #fff;
    cursor: pointer;
    font-weight: 600;
  }

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

export const Page = styled.div`
  width: 841px;
  height: 1250px;
  position: absolute;
  left: -9999px;
`;
