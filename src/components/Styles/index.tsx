import styled from 'styled-components';
import professionalData from '../../commons/professionalData';

export const Wrapper = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 80px 1fr 50px;

  h3 {
    text-align: center;
  }

  .menuButton {
    filter: opacity(1);
  }

  .opacity {
    filter: opacity(0);
  }

  .button-charge-treatments {
    position: absolute;
    width: 100%;
    top: 80px;
    background-color: ${professionalData.primaryColor};
    padding: 0 20px 20px 20px;
    text-align: center;
    transition: 0.4s;
    color: #fff;
    z-index: 1;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      .onHover {
        &:hover {
          background-color: #555;
          border-radius: 5px;
          cursor: pointer;
        }
      }
      li {
        padding: 20px;
        font-size: 12px;
        font-family: lato;
        letter-spacing: 2px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;

        img {
          width: 15px;
        }
      }
    }
  }

  .hide {
    top: -400px;
  }
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
  background-color: #7e9c7f;
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
  }
`;

export const Menu = styled.div`
  position: relative;
  height: 80px;
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

  h3 {
    margin-top: 0;
  }
`;

export const InputBox = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;

  label {
    color: #000;
    font-weight: 700;
  }

  input,
  select,
  textarea {
    margin-top: 5px;
    border: none;
    padding: 10px;
    border-radius: 5px;
  }

  input[type='submit'] {
    background-color: #7e9c7f;
    color: #fff;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

export const Page = styled.div`
  width: 841px;
  height: 1189px;
`;
