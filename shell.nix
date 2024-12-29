{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.python3
  ];
  shellHook = ''
    python3 -m http.server
  '';
}
